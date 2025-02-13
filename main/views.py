from django.shortcuts import render

# Create your views here.

def healthcheck(request):

    return "OK"

def index(request):
    return render(request, "main.html")