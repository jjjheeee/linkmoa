from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

from .models import User, FolderCategory, UrlList
from .forms import LoginForm

from dotenv import load_dotenv

import requests
import os
import json
# Create your views here.

load_dotenv()

def healthcheck(request):
    return HttpResponse("OK", status=200)

def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            user = authenticate(request, username=email, password=password)  # 유저 인증
            if user is not None:
                login(request, user)  # 유저 로그인
                return redirect("main")  # 로그인 후 리디렉션
            else:
                form.add_error(None, "로그인 정보가 틀렸습니다.")
    else:
        form = LoginForm()
    return render(request, 'signin-up.html', {'form': form})

def logout_view(request):
    logout(request)
    response = redirect("main")
    response.delete_cookie('sessionid')
    return redirect("main")

@login_required(login_url="/login")
def index(request):
    # User.objects.create_user(email="testuser@test.com", password="password123")
    user = request.user  # 현재 로그인된 유저 정보 가져오기
    folder_data = FolderCategory.objects.filter(user_id=request.user.id)
    data = {
        "user" : user,
        "folders":folder_data
    }

    return render(request, "main.html", data)

@require_http_methods(["POST"])
def create_folder_name(request):
    folder_name = request.POST.get("folderName")
    FolderCategory.objects.create(name=folder_name, user_id=request.user.id)
    return redirect("main")

@require_http_methods(["POST"])
def add_url(request):
    data = json.loads(request.body)  # JSON 데이터 파싱
    folder_id = data.get("folder_id")
    url = data.get("url")
    description = data.get("description")

    open_graph_url = os.getenv("GET_URL_DATA_API")
    params = {'url': url}
    response = requests.get(open_graph_url, params).json()

    response_data = response.get("data")
    name = response_data.get("title")
    image = response_data.get("image").get("url")

    UrlList.objects.create(name=name, link=url, image=image, folder_category_id=folder_id, description=description)

    return JsonResponse({"success": True})


@require_http_methods(["GET"])
def get_urls(request,folder_id):
    urls = UrlList.objects.filter(folder_category=folder_id)
    urls = [{"name":url.name, "link":url.link,"image":url.image} for url in urls]
    return JsonResponse({'urls': urls})
