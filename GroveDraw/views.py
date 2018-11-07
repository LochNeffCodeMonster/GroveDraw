from django.shortcuts import render
from django.http import HttpResponse


def index(request):
    return HttpResponse("This is the landing page for GroveDraw. Navigate to localhost:8000/GroveDraw/canvas.html")