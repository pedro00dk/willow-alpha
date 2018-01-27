from django.db.models import Model
from rest_framework import authentication, permissions, response, serializers, views, viewsets

from backend import models


def model_viewset_factory(model, base_serializer, base_viewset):

    # serializer
    meta = type('Meta', (object,), {})
    meta.model = model
    meta.fields = '__all__'
    serializer = type(f'{model.__name__}Serializer', (base_serializer,), {})
    serializer.Meta = meta

    # viewset
    viewset = type(f'{model.__name__}ViewSet', (base_viewset,), {})
    viewset.queryset = model.objects.all()
    viewset.serializer_class = serializer
    return viewset


_base_serializer, _base_viewset = serializers.HyperlinkedModelSerializer, viewsets.ModelViewSet

generated_viewsets = {model.__name__: model_viewset_factory(model, _base_serializer, _base_viewset)
                      for model in models.__dict__.values()
                      if isinstance(model, type) and issubclass(model, Model)}
