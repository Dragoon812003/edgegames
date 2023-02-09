import random
import string
from django.utils.text import slugify 
from datetime import datetime, timedelta
from edgegames import settings

def game_profile_picture_path(instance, filename):
    return f'profile_pics/{instance.id}/{filename}'

def user_profile_picture_path(instance, filename):
    return f'user_profile_pics/{instance.user.id}/{filename}'

def get_game_files_upload_to(instance, filename):
    return f'games/{instance.game.id}/{filename}'

def get_images_upload_to(instance, filename):
    return f'images/{instance.game.id}/{filename}'

def random_string_generator(size=10, chars=string.ascii_lowercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

def unique_slug_generator(instance, new_slug=None):
    
    if new_slug is not None:
        slug = new_slug
    else:
        slug = slugify(instance.title)

    Klass = instance.__class__
    qs_exists = Klass.objects.filter(slug=slug).exists()
    if qs_exists:
        new_slug = "{slug}-{randstr}".format(
            slug=slug,
            randstr=random_string_generator(size=4)
        )
        return unique_slug_generator(instance, new_slug=new_slug)
    return slug

def slug_generator(sender, instance, *args, **kwargs):
    if not instance.slug:
        instance.slug = unique_slug_generator(instance)

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def trendiness_score(game):
    one_week_ago = datetime.now() - timedelta(days=7)
    views_in_last_week = game.game_views.filter(created_at__gte=one_week_ago).count()
    total_views = game.game_views.count()
    return views_in_last_week / total_views