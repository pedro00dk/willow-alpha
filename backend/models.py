import os

from django.db import models
from willow.settings import DATABASES_DIR


DATABASE_FILES_DIR = os.path.join(DATABASES_DIR, 'files')

def exercises_file_readme_uploader(instance, filename):
    return os.path.join(DATABASE_FILES_DIR, f'{type(instance).__name__}/{instance.id}/README.txt')

def exercises_file_input_ex_uploader(instance, filename):
    return os.path.join(DATABASE_FILES_DIR, f'{type(instance).__name__}/{instance.id}/input_ex.txt')

def exercises_file_input_uploader(instance, filename):
    return os.path.join(DATABASE_FILES_DIR, f'{type(instance).__name__}/{instance.id}/input.txt')

class Exercise(models.Model):
    name = models.CharField(unique=True, max_length=30)
    readme = models.FileField(upload_to=exercises_file_readme_uploader)
    input_ex = models.FileField(upload_to=exercises_file_input_ex_uploader)
    imput = models.FileField(upload_to=exercises_file_input_uploader)
