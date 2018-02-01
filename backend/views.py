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

    def post(self, request, format=None):
        #compressed_tracer = tracer.CompressedTracer()
        return response.Response({'result': 'traced data'})
