from django.db import models
from django.contrib.auth.models import User

class Article(models.Model):
    titre = models.CharField(max_length=100)
    contenu = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titre


class Tirage(models.Model):
    number = models.IntegerField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.number}"


class Bet(models.Model):
    BET_TYPES = [
        ("STRAIGHT", "Numéro plein"),      # ex: 17, payout 35:1
        ("COLOR", "Couleur"),              # RED / BLACK, 1:1
        ("LOWHIGH", "1-18 / 19-36"),       # 1:1
        ("EVENODD", "Pair / Impair"),      # 1:1
        ("DOZEN", "Douzaine"),             # 2:1
        ("COLUMN", "Colonne"),             # 2:1
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bet_type = models.CharField(max_length=20, choices=BET_TYPES)
    value = models.CharField(max_length=20)  # ex: "17", "RED", "LOW", "1ST12", "COL1"
    amount = models.IntegerField()          # nombre de points/jetons misés
    won_amount = models.IntegerField(default=0)
    drawn_number = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.bet_type} {self.value} ({self.amount})"


        
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    balance = models.IntegerField(default=20)  # 20€ au départ

    def __str__(self):
        return f"{self.user.username} - {self.balance}€"