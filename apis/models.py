from django.db import models
from django.contrib.auth.models import User
from main.models import *

# Create your models here.

class Score(models.Model):
    score = models.IntegerField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.game.title}: {self.user.username}: {self.score}'
