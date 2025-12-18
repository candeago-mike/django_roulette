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
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.number}"


class Tirage(models.Model):
    number = models.IntegerField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
