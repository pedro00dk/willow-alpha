from django.db.models import Model
from rest_framework import viewsets

from backend import models
from backend import serializers


class ExerciseViewset(viewsets.ModelViewSet):
    queryset = models.Exercise.objects.all()
    serializer_class = serializers.ExerciseSerializer
