from django.db.models import Model
from rest_framework import response, views, viewsets

from backend import models
from backend import serializers


class ExerciseViewset(viewsets.ModelViewSet):
    queryset = models.Exercise.objects.all()
    serializer_class = serializers.ExerciseSerializer


class TracerAPIView(views.APIView):

    def get(self, request, format=None):
        return response.Response({'results': 'some data'})

    def post(self, request, format=None):
        return response.Response({'result': 'traced data'})
