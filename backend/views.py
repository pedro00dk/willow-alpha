from django.contrib.auth import logout
from django.contrib.auth.models import Group, User
from rest_framework import permissions, response, status, views, viewsets

from backend import models, serializers
from backend.tracer import tracer


# extra permissions

class IsReadonly(permissions.BasePermission):

    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS or request.user and request.user.is_staff


# util functions

def require_option(request, option_name):
    option = request.data.get(option_name)
    error_response = None if option is not None else response.Response(
        {'detail': f'{option_name} not provided'}, status=status.HTTP_400_BAD_REQUEST
    )
    return option, error_response


def option_not_supported(option, options):
    return response.Response(
        {'detail': f'option {option} not supported, options available are {[*options]}'}, status.HTTP_400_BAD_REQUEST
    )


# view sets

class UserViewSet(viewsets.ModelViewSet):

    permission_classes = (permissions.IsAdminUser,)
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = serializers.UserSerializer


class GroupViewSet(viewsets.ModelViewSet):

    permission_classes = (permissions.IsAdminUser,)
    queryset = Group.objects.all()
    serializer_class = serializers.GroupSerializer


class ExerciseViewSet(viewsets.ModelViewSet):

    permission_classes = (IsReadonly,)
    queryset = models.Exercise.objects.all()
    serializer_class = serializers.ExerciseSerializer


# api views

class CurrentUserAPIView(views.APIView):

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        option, error_response = require_option(request, 'option')
        if error_response is not None:
            return error_response
        options = {
            'info': self.info,
            'logout': self.logout
        }
        action = options.get(option, lambda req: option_not_supported(option, options))
        return action(request)

    def info(self, request):
        serializer = serializers.UserSerializer(User.objects.get(id=request.user.id))
        return response.Response({'detail': 'info', **serializer.data})

    def logout(self, request):
        logout(request)
        return response.Response({'detail': 'logout'})


class TracerAPIView(views.APIView):

    permission_classes = (permissions.IsAuthenticated,)
    user_tracers = {}

    def post(self, request):
        option, error_response = require_option(request, 'option')
        if error_response is not None:
            return error_response
        options = {
            'start': self.start,
            'stop': self.stop,
            'step_over': lambda req: self.step(req, 'step_over'),
            'step_into': lambda req: self.step(req, 'step_into'),
            'step_out': lambda req: self.step(req, 'step_out'),
            'input': self.input
        }
        action = options.get(option, lambda req: option_not_supported(option, options))
        return action(request)

    def require_tracer(self, request):
        user_tracer = TracerAPIView.user_tracers.get(request.user.id)
        error_response = None if user_tracer is not None else response.Response(
            {'detail': 'missing tracer'}, status=status.HTTP_400_BAD_REQUEST
        )
        return user_tracer, error_response

    def start(self, request):
        script, error_response = require_option(request, 'script')
        if error_response is not None:
            return error_response
        user_tracer, error_response = self.require_tracer(request)
        if user_tracer is not None:
            try:
                user_tracer.stop()
            except:
                pass
        user_tracer = tracer.StepTracerController(script)
        TracerAPIView.user_tracers[request.user.id] = user_tracer
        trace_response = user_tracer.start()
        return response.Response({'detail': 'start', 'responses': trace_response})

    def stop(self, request):
        user_tracer, error_response = self.require_tracer(request)
        if error_response is not None:
            return error_response
        try:
            user_tracer.stop()
        except:
            pass
        TracerAPIView.user_tracers.pop(request.user.id)
        return response.Response({'detail': 'stop'})

    def step(self, request, step_type):
        user_tracer, error_response = self.require_tracer(request)
        if error_response is not None:
            return error_response
        step_method = getattr(user_tracer,  step_type)
        try:
            tracer_responses = step_method()
            return response.Response({'detail': f'{step_type}', 'responses': tracer_responses})
        except Exception as e:
            return response.Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def input(self, request):
        input_data, error_response = require_option(request, 'input')
        if error_response is not None:
            return error_response
        user_tracer, error_response = self.require_tracer(request)
        if error_response is not None:
            return error_response
        if type(input_data) == list:
            for data in input_data:
                user_tracer.send_input(str(data))
        else:
            user_tracer.send_input(str(input_data))
        return response.Response({'detail': 'input'})
