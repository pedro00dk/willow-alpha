from django.urls import path
from django.views import generic

from . import views


urlpatterns = [
    path('', generic.TemplateView.as_view(template_name='index.html')),
    path('run', views.Run.as_view(), name='run')
]