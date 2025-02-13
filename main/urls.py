from django.contrib import admin
from django.urls import path
from .views import index, healthcheck

urlpatterns = [
    path('healthcheck', healthcheck, name='healthcheck'),
    path('', index, name='main'),
]