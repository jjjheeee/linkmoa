from django.urls import path
from .views import index, healthcheck, login_view, logout_view, folder_api_class, url_api_class

urlpatterns = [
    path('healthcheck', healthcheck, name='healthcheck'),
    path("", index, name='main'),
    path("login/", login_view, name='login'),
    path("logout/", logout_view, name='logout'),
    path("folder-api/", folder_api_class, name='folder-api'),
    path("urls-api/", url_api_class, name='urls-api'),
    path("urls-api/<int:folder_id>/", url_api_class, name='urls-api'),
    
]