from django.urls import include, path, re_path
from django.views import generic
from rest_framework import routers

from backend import views


viewsets_routes = routers.DefaultRouter()
viewsets_routes.register('users', views.UserViewSet)
viewsets_routes.register('groups', views.GroupViewSet)
viewsets_routes.register('exercises', views.ExerciseViewset)

urlpatterns = [
    path('', generic.TemplateView.as_view(template_name='index.html')),
    path('', include(viewsets_routes.urls)),
    path('tracer', views.TracerAPIView.as_view()),

    re_path(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    re_path(r'^auth/', include('social_django.urls', namespace='social')),
    path('auth/complete/google-oauth2/', generic.RedirectView.as_view(url='/'))
]
