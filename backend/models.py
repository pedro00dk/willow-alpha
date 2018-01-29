import os

from django.db import models


class Exercise(models.Model):
    name = models.CharField(unique=True, max_length=30)
    readme = models.TextField()
    input_ex = models.TextField()
    input = models.TextField()
