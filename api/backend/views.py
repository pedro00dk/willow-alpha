from rest_framework import permissions, response, status, views, viewsets
from backend import models, serializers
from backend.tracer import tracer


class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = models.Exercise.objects.all()
    serializer_class = serializers.ExerciseSerializer


class TracerAPIView(views.APIView):

    tracers = {}

    def get_session(self, request):
        if not request.session._session_key:
            request.session.create()
        return request.session._session_key

    def get(self, request):
        return response.Response({ses: trc.state.name for ses, trc in TracerAPIView.tracers.items()})

    def post(self, request):
        session = self.get_session(request)
        option = request.data.get('option')
        options = {
            'start': self.start,
            'stop': self.stop,
            'step_over': lambda req, ses: self.step(req, ses, 'step_over'),
            'step_into': lambda req, ses: self.step(req, ses, 'step_into'),
            'step_out': lambda req, ses: self.step(req, ses, 'step_out'),
            'input': self.input
        }
        action = options.get(
            option, lambda req, ses: response.Response({'error': 'option not provided or supported'}, status=400)
        )
        return action(request, session)

    def start(self, request, session):
        self.stop(request, session)
        script = request.data.get('script')
        if not script:
            return response.Response({'error': 'script not provided'}, status=400)
        trc = tracer.StepTracerController(script)
        TracerAPIView.tracers[session] = trc
        result = trc.start()
        return response.Response({'result': result})

    def stop(self, request, session):
        trc = TracerAPIView.tracers.get(session)
        if trc:
            try:
                trc.stop()
                TracerAPIView.tracers.pop(session)
            except Exception:
                pass
        return response.Response({'result': 'ok'})

    def step(self, request, session, step_type):
        trc = TracerAPIView.tracers.get(session)
        if not trc or trc.get_state() == 'STOPPED':
            self.stop(request, session)
            return response.Response({'error': 'tracer not running'}, status=400)
        trc_step = getattr(trc, step_type)
        try:
            return response.Response({'result': trc_step()})
        except Exception:
            self.stop(request, session)
            return response.Response({'error': 'tracer internal error'}, status=500)

    def input(self, request, session):
        trc = TracerAPIView.tracers.get(session)
        if not trc or trc.get_state() == 'STOPPED':
            self.stop(request, session)
            return response.Response({'error': 'tracer not running'}, status=400)
        line = request.data.get('input')
        if not line:
            return response.Response({'error': 'line not provided'}, status=400)
        try:
            trc.send_input(str(line))
            return response.Response({'result': 'ok'})
        except Exception:
            self.stop(request, session)
            return response.Response({'error': 'tracer internal error'}, status=500)
