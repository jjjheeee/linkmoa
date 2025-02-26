from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout

from .models import User, FolderCategory, UrlList

from .forms import LoginForm

# Create your views here.

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
    folder_data = [
        {"id": 1, "name": "개발 자료"},
        {"id": 2, "name": "읽을 문서"},
        {"id": 3, "name": "프로젝트 아이디어"},
        {"id": 4, "name": "스터디 자료"},
        {"id": 5, "name": "즐겨찾기"},
    ]
    data = {
        "user" : user,
        "folders":folder_data
    }
    return render(request, "main.html", data)
