from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.db import transaction
import random
import json

from .models import Tirage, Bet, Profile


def register_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        if User.objects.filter(username=username).exists():
            messages.error(request, "Nom d'utilisateur déjà utilisé")
        else:
            User.objects.create_user(username=username, password=password)
            messages.success(request, "Compte créé avec succès")
            return redirect("login")
    return render(request, "casino_app/register.html")


def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect("/")
        else:
            messages.error(request, "Identifiants invalides")
    return render(request, "casino_app/login.html")


def logout_view(request):
    logout(request)
    return redirect("login")


def roulette_view(request):
    if not request.user.is_authenticated:
        return redirect("login")

    profile, created = Profile.objects.get_or_create(
        user=request.user,
        defaults={"balance": 50},  # solde de départ
    )

    return render(
        request,
        "casino_app/roulette.html",
        {"balance": profile.balance},
    )


def home_view(request):
    return render(request, "casino_app/home.html")


def regles_view(request):
    return render(request, "casino_app/regles.html")


@login_required
def spin_roulette(request):
    number = random.randint(0, 36)

    Tirage.objects.create(
        number=number,
        user=request.user,
    )

    return JsonResponse({"number": number})


NUMBER_COLORS = {
    0: "GREEN",
    1: "RED",
    2: "BLACK",
    3: "RED",
    4: "BLACK",
    5: "RED",
    6: "BLACK",
    7: "RED",
    8: "BLACK",
    9: "RED",
    10: "BLACK",
    11: "BLACK",
    12: "RED",
    13: "BLACK",
    14: "RED",
    15: "BLACK",
    16: "RED",
    17: "BLACK",
    18: "RED",
    19: "RED",
    20: "BLACK",
    21: "RED",
    22: "BLACK",
    23: "RED",
    24: "BLACK",
    25: "RED",
    26: "BLACK",
    27: "RED",
    28: "BLACK",
    29: "BLACK",
    30: "RED",
    31: "BLACK",
    32: "RED",
    33: "BLACK",
    34: "RED",
    35: "BLACK",
    36: "RED",
}


def is_low(number):
    return 1 <= number <= 18


def is_high(number):
    return 19 <= number <= 36


def is_even(number):
    return number != 0 and number % 2 == 0


def is_odd(number):
    return number % 2 == 1


def get_dozen(number):
    if 1 <= number <= 12:
        return "1ST12"
    if 13 <= number <= 24:
        return "2ND12"
    if 25 <= number <= 36:
        return "3RD12"
    return None


def get_column(number):
    if number == 0:
        return None
    if number % 3 == 1:
        return "COL1"
    if number % 3 == 2:
        return "COL2"
    return "COL3"


@login_required
@require_POST
def bet_and_spin(request):
    data = json.loads(request.body.decode("utf-8"))
    bets = data.get("bets", [])

    # profil avec solde initial
    profile, created = Profile.objects.get_or_create(
        user=request.user,
        defaults={"balance": 50},
    )

    with transaction.atomic():
        # on lock le profil en DB
        profile = Profile.objects.select_for_update().get(pk=profile.pk)

        drawn_number = random.randint(0, 36)
        total_bet = 0
        total_win = 0
        bets_result = []

        color = NUMBER_COLORS[drawn_number]
        dozen = get_dozen(drawn_number)
        column = get_column(drawn_number)

        # calcul mise totale
        for b in bets:
            amount = int(b.get("amount", 0))
            if amount > 0:
                total_bet += amount

        # vérif solde
        if total_bet > profile.balance:
            return JsonResponse(
                {"error": "Solde insuffisant", "balance": profile.balance},
                status=400,
            )

        # débite la mise totale
        profile.balance -= total_bet

        # calcul des gains
        for b in bets:
            b_type = b.get("type")
            value = b.get("value")
            amount = int(b.get("amount", 0))
            if amount <= 0:
                continue

            win = 0

            if b_type == "STRAIGHT":
                if drawn_number == int(value):
                    win = amount * 35

            elif b_type == "COLOR":
                if drawn_number != 0 and color == value:
                    win = amount * 2

            elif b_type == "LOWHIGH":
                if drawn_number != 0:
                    if value == "LOW" and is_low(drawn_number):
                        win = amount * 2
                    elif value == "HIGH" and is_high(drawn_number):
                        win = amount * 2

            elif b_type == "EVENODD":
                if drawn_number != 0:
                    if value == "EVEN" and is_even(drawn_number):
                        win = amount * 2
                    elif value == "ODD" and is_odd(drawn_number):
                        win = amount * 2

            elif b_type == "DOZEN":
                if dozen and value == dozen:
                    win = amount * 3

            elif b_type == "COLUMN":
                if column and value == column:
                    win = amount * 3

            total_win += win

            bet_obj = Bet.objects.create(
                user=request.user,
                bet_type=b_type,
                value=value,
                amount=amount,
                won_amount=win,
                drawn_number=drawn_number,
            )

            bets_result.append(
                {
                    "id": bet_obj.id,
                    "type": b_type,
                    "value": value,
                    "amount": amount,
                    "win": win,
                }
            )

        # crédite les gains
        profile.balance += total_win
        profile.save(update_fields=["balance"])

    return JsonResponse(
        {
            "number": drawn_number,
            "color": color,
            "total_bet": total_bet,
            "total_win": total_win,
            "net": total_win - total_bet,
            "balance": profile.balance,
            "bets": bets_result,
        }
    )
