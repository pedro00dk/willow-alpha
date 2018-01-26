from django.db.models import Model
from rest_framework import serializers
from rest_framework import viewsets

from backend import models


def model_serializer_factory(model, base_serializer):
    meta = type('Meta', (object,), {})
    meta.model = model
    meta.fields = '__all__'
    serializer = type(f'{model.__name__}Serializer', (base_serializer,), {})
    serializer.Meta = meta
    return serializer


def model_viewset_factory(model, serializer, base_viewset):
    viewset = type(f'{model.__name__}ViewSet', (base_viewset,), {})
    viewset.queryset = model.objects.all()
    viewset.serializer_class = serializer
    return viewset


base_serializer = serializers.HyperlinkedModelSerializer
base_viewset = viewsets.ModelViewSet


generated_serializers = {model.__name__: model_serializer_factory(model, base_serializer)
                         for model in models.__dict__.values()
                         if isinstance(model, type) and issubclass(model, Model)}

generated_viewsets = {model.__name__: model_viewset_factory(model, generated_serializers[model.__name__], base_viewset)
                      for model in models.__dict__.values()
                      if isinstance(model, type) and issubclass(model, Model)}
