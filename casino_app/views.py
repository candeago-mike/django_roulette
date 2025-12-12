from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages

def register_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        if User.objects.filter(username=username).exists():
            messages.error(request, "Nom d'utilisateur déjà utilisé")
        else:
            User.objects.create_user(username=username, password=password)
            messages.success(request, "Compte créé avec succès")
            return redirect('login')
    return render(request, 'casino_app/register.html')

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('roulette')
        else:
            messages.error(request, "Identifiants invalides")
    return render(request, 'casino_app/login.html')

def logout_view(request):
    logout(request)
    return redirect('login')

def roulette_view(request):
    # if not request.user.is_authenticated:
    #     return redirect('login')
    return render(request, 'casino_app/roulette.html')

def home_view(request):
    return render(request, 'casino_app/home.html')
