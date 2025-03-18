from django.urls import path
from .views import index, healthcheck, login_view, logout_view, folder_api_class, get_urls, add_url

urlpatterns = [
    path('healthcheck', healthcheck, name='healthcheck'),
    path("", index, name='main'),
    path("login/", login_view, name='login'),
    path("logout/", logout_view, name='logout'),
    path("folder-api/", folder_api_class, name='folder-api'),
    path("get-urls/<int:folder_id>/", get_urls, name='get-urls'),
    path("add-url/", add_url, name='add-url'),
]