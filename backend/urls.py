from django.urls import include, path, re_path
from django.views import generic
from rest_framework import routers

from backend import views


viewsets_routes = routers.DefaultRouter()
viewsets_routes.register('users', views.UserViewSet)
viewsets_routes.register('groups', views.GroupViewSet)
viewsets_routes.register('exercises', views.ExerciseViewSet)

urlpatterns = [
    path('', generic.TemplateView.as_view(template_name='index.html')),
    path('', include(viewsets_routes.urls)),

    re_path(r'^current_user/', views.CurrentUserAPIView.as_view()),
    re_path(r'^tracer/', views.TracerAPIView.as_view()),

    re_path(r'^auth/', include('social_django.urls', namespace='social'))
]
