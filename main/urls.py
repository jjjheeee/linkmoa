from django.urls import path
from .views import index, healthcheck, login_view, logout_view, create_folder_name, get_urls, add_url

urlpatterns = [
    path('healthcheck', healthcheck, name='healthcheck'),
    path("", index, name='main'),
    path("login/", login_view, name='login'),
    path("logout/", logout_view, name='logout'),
    path("create-folder/", create_folder_name, name='create-folder'),
    path("get-urls/<int:folder_id>/", get_urls, name='get-urls'),
    path("add-url/", add_url, name='add-url'),
]