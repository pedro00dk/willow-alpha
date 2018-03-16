from django.urls import include, path, re_path
from django.views import generic
from rest_framework import routers

from backend import views


viewsets_routes = routers.DefaultRouter()
viewsets_routes.register('users', views.UserViewSet)
viewsets_routes.register('groups', views.GroupViewSet)
viewsets_routes.register('exercises', views.ExerciseViewSet)
viewsets_routes.register('exercises_id_name', views.ExerciseIdNameViewSet)
viewsets_routes.register('exercises_public_data', views.ExercisePublicDataViewSet)

urlpatterns = [
    path('', generic.TemplateView.as_view(template_name='index.html')),
    path('', include(viewsets_routes.urls)),

    re_path(r'^user/', views.UserAPIView.as_view()),
    re_path(r'^tracer/', views.TracerAPIView.as_view()),

    re_path(r'^auth/', include('social_django.urls', namespace='social'))
]
