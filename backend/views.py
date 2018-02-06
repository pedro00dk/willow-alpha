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
        option, error_response = self.require_option(request, 'option')
        if error_response is not None:
            return error_response
        if option == 'start' or option == 'restart':
            return self.start_tracer(request)
        if option == 'stop':
            return self.stop_tracer(request)
        if option == 'input':
            return self.send_input(request)
        if option == 'stepinto' or option == 'stepover' or option == 'stepout':
            return self.tracer_step(request, option)
        return response.Response(
            {'detail': 'option not supported'}, status=status.HTTP_400_BAD_REQUEST
        )

    def require_option(self, request, option_name):
        option = request.data.get(option_name)
        error_response = None if option is not None else response.Response(
            {'detail': f'{option_name} not provided'}, status=status.HTTP_400_BAD_REQUEST
        )
        return option, error_response

    def require_tracer(self, request):
        user_tracer = TracerAPIView.user_tracers.get(request.user.id)
        error_response = None if user_tracer is not None else response.Response(
            {'detail': 'no tracer running'}, status=status.HTTP_400_BAD_REQUEST
        )
        return user_tracer, error_response

    def start_tracer(self, request):
        script, error_response = self.require_option(request, 'script')
        if error_response is not None:
            return error_response
        user_tracer, error_response = self.require_tracer(request)
        if user_tracer is not None:
            try:
                user_tracer.stop()
            except Exception as e:
                pass
        TracerAPIView.user_tracers[request.user.id] = tracer.StepTracerController(script)
        return response.Response(
            {'detail': f'tracer {"restarted" if user_tracer is not None else "started"}'}
        )

    def stop_tracer(self, request):
        user_tracer, error_response = self.require_tracer(request)
        if error_response is not None:
            return error_response
        try:
            user_tracer.stop()
        except Exception as e:
            pass
        TracerAPIView.user_tracers.pop(request.user.id)
        return response.Response({'detail': 'tracer stopped'})

    def send_input(self, request):
        input_data, error_response = self.require_option(request, 'input')
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
        return response.Response({'detail': 'input received'})

    def tracer_step(self, request, step_type):
        user_tracer, error_response = self.require_tracer(request)
        if error_response is not None:
            return error_response
        try:
            if step_type == 'stepinto':
                events = user_tracer.step_into()
            if step_type == 'stepover':
                events = user_tracer.step_over()
            if step_type == 'stepout':
                events = user_tracer.step_out()
            return response.Response({'detail': step_type, 'events': events})
        except Exception as e:
            return response.Response(
                {'detail': str(e), 'events': []},
                status=status.HTTP_400_BAD_REQUEST
            )
