from django.contrib.auth import logout
from django.contrib.auth.models import Group, User
from django.db.models import Model
from rest_framework import permissions, response, status, views, viewsets
from rest_framework.parsers import JSONParser

from backend import models, serializers
from backend.tracer import tracer


# extra permissions

class IsReadonly(permissions.BasePermission):

    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS or request.user and request.user.is_staff


# viewsets

class UserViewSet(viewsets.ModelViewSet):

    permission_classes = (permissions.IsAdminUser,)
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = serializers.UserSerializer


class GroupViewSet(viewsets.ModelViewSet):

    permission_classes = (permissions.IsAdminUser,)
    queryset = Group.objects.all()
    serializer_class = serializers.GroupSerializer


class ExerciseViewset(viewsets.ModelViewSet):

    permission_classes = (IsReadonly,)
    queryset = models.Exercise.objects.all()
    serializer_class = serializers.ExerciseSerializer


# api views

class CurrentUserControllerAPIView(views.APIView):

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, format=None):
        instance = User.objects.get(id=request.user.id)
        if 'info' in request.data and request.data['info']:
            serializer = serializers.UserSerializer(instance)
            return response.Response(serializer.data)
        elif 'logout' in request.data and request.data['logout']:
            logout(request)
            return response.Response({'detail': 'logout successful'})
        return response.Response(
            {'detail': 'option not provided or supported'},
            status=status.HTTP_400_BAD_REQUEST
        )


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
            return response.Response(
                {'detail': 'tracer not initialized'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user_tracer = TracerAPIView.user_tracers[request.user.id]
        if 'stop' in request.data and request.data['stop'] == True:
            user_tracer.stop()
            TracerAPIView.user_tracers.pop(request.user.id)
            return response.Response({'detail': 'tracer ended'})
        if 'input' in request.data:
            user_tracer.send_input(input_data)
        try:
            event, value = user_tracer.next_event()
        except Exception as e:
            TracerAPIView.user_tracers.pop(request.user.id)
            return response.Response({'detail': 'tracer ended'})
        return response.Response({'trace_event': event, 'value': value})
