from django.urls import path
from .views import index, healthcheck, login_view, logout_view

urlpatterns = [
    path('healthcheck', healthcheck, name='healthcheck'),
    path("", index, name='main'),
    path("login/", login_view, name='login'),
    path("logout/", logout_view, name='logout'),
]