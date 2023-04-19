from django.db import models
from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import pre_save
from django.db.models import Count
from django_cleanup import cleanup
from .utils import *

@cleanup.ignore
class IpModel(models.Model):
    ip = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.ip

class Game(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    developer = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    profile_picture = models.ImageField(upload_to=game_profile_picture_path, blank=True, null=True)
    slug = models.SlugField(max_length=200, unique=True, null=False)
    is_available_on_mobile = models.BooleanField(default=False)
    is_available_on_tablet = models.BooleanField(default=False)
    is_available_on_desktop = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    views = models.ManyToManyField(IpModel, related_name='game_views', blank=True)

    def __str__(self):
        return self.title

    def get_views(self):
        return self.views.count()

class GameFile(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    file = models.FileField(upload_to=get_game_files_upload_to)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.game.title}: {self.file.name}'

class ImageFile(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    image = models.FileField(upload_to=get_images_upload_to)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.game.title}: {self.image.name}'

@cleanup.ignore
class Account(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="user_account")
    faviorates = models.ManyToManyField(Game, blank=True)
    is_developer = models.BooleanField(default=False)
    profile_pic = models.ImageField(upload_to=user_profile_picture_path, blank=True, null=True)
    about = models.TextField(blank=True, null=True)
    instagram_link = models.CharField(blank=True, null=True, max_length=100)
    twitter_link = models.CharField(blank=True, null=True, max_length=100)
    linkedin_link = models.CharField(blank=True, null=True, max_length=100)
    github_link = models.CharField(blank=True, null=True, max_length=100)

@cleanup.ignore
class Review(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, null=True, blank=True, related_name="review_game")
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="review_user")
    stars = models.IntegerField()
    comment = models.TextField(max_length=1000)
    date = models.DateTimeField(auto_now_add=True)
    is_edited = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username + ": " + self.comment

    def get_account(user):
        return Account.objects.get(user=user) 

pre_save.connect(slug_generator, sender=Game)

