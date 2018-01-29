from django.urls import include, path, re_path
from django.views import generic
from rest_framework import routers

from backend import views


viewsets_routes = routers.DefaultRouter()
viewsets_routes.register('Exercise', views.ExerciseViewset)

urlpatterns = [
    path('', generic.TemplateView.as_view(template_name='index.html')),
    re_path(r'^', include(viewsets_routes.urls)),

    re_path(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]
