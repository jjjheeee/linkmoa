from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

def healthcheck(request):
    return HttpResponse("OK", status=200)

def index(request):
    return render(request, "main.html")