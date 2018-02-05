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
        if 'option' not in request.data:
            return response.Response(
                {'detail': 'option not provided or supported'},
                status=status.HTTP_400_BAD_REQUEST
            )
        option = request.data['option']
        if option == 'info':
            serializer = serializers.UserSerializer(User.objects.get(id=request.user.id))
            return response.Response({'detail': 'user information sent', **serializer.data})
        elif option == 'logout':
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
        if 'option' not in request.data:
            return response.Response(
                {'detail': 'option not provided or supported'},
                status=status.HTTP_400_BAD_REQUEST
            )
        option = request.data['option']
        user_tracer = TracerAPIView.user_tracers[request.user.id] \
            if request.user.id in TracerAPIView.user_tracers else None
        if option == 'start' or option == 'restart':
            if 'script' not in request.data:
                return response.Response(
                    {'detail': 'script not provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            script = request.data['script']
            is_restarting = user_tracer is not None
            if is_restarting:
                try:
                    user_tracer.stop()
                except Exception as e:
                    pass
            TracerAPIView.user_tracers[request.user.id] = tracer.StepTracerController(script)
            return response.Response({'detail': f'tracer {"re" if is_restarting else ""}started'})
        if option == 'stop':
            if user_tracer is None:
                return response.Response(
                    {'detail': 'no tracer running'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user_tracer.stop()
            TracerAPIView.user_tracers.pop(request.user.id)
            return response.Response({'detail': 'tracer stopped'})
        if option == 'input':
            if user_tracer is None:
                return response.Response(
                    {'detail': 'no tracer running'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if 'input' not in request.data:
                return response.Response(
                    {'detail': 'input not provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            input_data = request.data['input']
            if type(input_data) == list:
                for data in input_data:
                    user_tracer.send_input(str(data))
            else:
                user_tracer.send_input(str(input_data))
            return response.Response({'detail': 'input received'})
        if option == 'stepinto' or option == 'stepover' or option == 'stepout':
            if user_tracer is None:
                return response.Response(
                    {'detail': 'no tracer running'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if option == 'stepinto':
                events = user_tracer.step_into()
            if option == 'stepover':
                events = user_tracer.step_over()
            if option == 'stepout':
                events = user_tracer.step_out()            
            return response.Response({'detail': option, 'events': events})
        return response.Response(
            {'detail': 'option not provided or supported'},
            status=status.HTTP_400_BAD_REQUEST
        )
