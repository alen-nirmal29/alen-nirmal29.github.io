from django.urls import path
from . import views

urlpatterns = [
    path('google/', views.google_auth, name='google_auth'),
    path('verify/', views.verify_token, name='verify_token'),
    path('logout/', views.logout, name='logout'),
] 