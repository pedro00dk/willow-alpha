from django.db.models import Model
from rest_framework import serializers

from backend import models


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Exercise
        fields = ('name', 'readme', 'input_ex')
