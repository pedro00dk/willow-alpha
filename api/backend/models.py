from django.db import models


class Exercise(models.Model):
    name = models.CharField(unique=True, max_length=30)
    code = models.TextField()
