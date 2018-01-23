from django.urls import path
from django.views import generic


urlpatterns = [
    path('', generic.TemplateView.as_view(template_name='index.html'))
]