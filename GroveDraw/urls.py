from django.urls import path

from GroveDraw import views

urlpatterns = [
    path('', views.index, name='index')
]