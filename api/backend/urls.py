from django.urls import include, path
from rest_framework import routers

from backend import views


routes = routers.DefaultRouter()
routes.register('exercise', views.ExerciseViewSet)

urlpatterns = [
    path('', include(routes.urls)),
    path('tracer/', views.TracerAPIView.as_view())
]
