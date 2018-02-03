from django.contrib.auth.models import Group, User
from django.db.models import Model
from rest_framework import permissions, response, views, viewsets
from rest_framework.parsers import JSONParser

from backend import models, serializers
from backend.tracer import tracer


class UserViewSet(viewsets.ModelViewSet):

    permission_classes = (permissions.IsAdminUser,)
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = serializers.UserSerializer


class CurrentUserAPIView(views.APIView):

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, format=None):
        instance = User.objects.get(id=request.user.id)
        serializer = serializers.UserSerializer(instance)
        return response.Response(serializer.data)
        

class GroupViewSet(viewsets.ModelViewSet):

    permission_classes = (permissions.IsAdminUser,)
    queryset = Group.objects.all()
    serializer_class = serializers.GroupSerializer


class ExerciseViewset(viewsets.ModelViewSet):

    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    queryset = models.Exercise.objects.all()
    serializer_class = serializers.ExerciseSerializer


class TracerAPIView(views.APIView):

    permission_classes = (permissions.IsAuthenticated,)
    user_tracers = {}

    def post(self, request, format=None):
        script = request.data['script']
        has_tracer = request.user.id in TracerAPIView.user_tracers
        if has_tracer:
            try:
                TracerAPIView.user_tracers[request.user.id].stop()
            except Exception as e:
                pass
        TracerAPIView.user_tracers[request.user.id] = tracer.FilteredTracerController(script)
        return response.Response({'detail': 'tracer started'})


class TracerNextEventAPIView(views.APIView):

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, format=None):
        if request.user.id not in TracerAPIView.user_tracers:
            return response.Response({'detail': 'tracer not initialized'})
        user_tracer = TracerAPIView.user_tracers[request.user.id]
        if 'input' in request.data:
            user_tracer.send_input(input_data)
        try:
            event, value = user_tracer.next_event()
        except Exception as e:
            return response.Response({'detail': 'tracer ended'})
        return response.Response({'trace_event': event, 'value': value})



