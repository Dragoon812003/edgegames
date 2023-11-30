from django.shortcuts import render, get_object_or_404, HttpResponse, redirect, reverse
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.db.models import Max
from django.contrib import messages
from django.templatetags.static import static
from main.models import *
from .models import *
import json
import os

def add_score(request):
    if request.method == "POST":
        body = request.body.decode('utf-8')
        data = json.loads(body)
        score = data["score"]
        game = get_object_or_404(Game, slug=data["game_slug"])
        highest_score = Score.objects.filter(game=game).aggregate(Max('score'))['score__max'] or 0

        try:
            score = float(score)
        except ValueError:
            response = {"error": "ValueError", "error_message": "The provided score must be of float data type or a value that can be successfully parsed as a float."}
            return JsonResponse(response, safe=False)
        
        if request.user.is_authenticated:
            player_score = Score.objects.filter(user=request.user, game=game)
            player_high_score = player_score.aggregate(Max('score'))['score__max'] or 0

            is_player_highest_score, is_highest_score = False, False
            if score > player_high_score:
                for item in player_score:
                    item.delete()
                new_score = Score.objects.create(score=score, user=request.user, game=game)
                new_score.save()
                is_player_highest_score = True

            if score > highest_score:
                is_highest_score = True

            response = {"is_highest_score": is_highest_score, "is_players_highest_score": is_player_highest_score, "players_score": score, "is_authenticated": True}
            return JsonResponse(response, safe=False)
        else:
            if score > highest_score:
                request.session['highest_score'] = score
                request.session['game_slug'] = data["game_slug"]
                request.session.save()
                messages.success(request, f"Congratulations! You've reached a new worldwide high score of {score} in the game {game.title}. To safeguard your accomplishment, please either create an account or log in. Doing so will securely store your high score.")
                return JsonResponse({"is_authenticated": False, "redirect_url": reverse('signup')})
            return JsonResponse({"is_authenticated": False}, safe=False)
    return HttpResponse("What are you trying to do!")

def get_high_scores(request, game_slug, num):
    game = get_object_or_404(Game, slug=game_slug)
    if num > 15: num = 15
    scores = Score.objects.filter(game=game).order_by('-score')[:num]
    high_scores = [{'rank': i+1, 'score': score.score, 'user': score.user.username} for i, score in enumerate(scores)]
    return JsonResponse({'high_scores': high_scores})

def get_user_info(request):
    if request.method == "POST":
        if request.user.is_authenticated:
            body = request.body.decode('utf-8')
            data = json.loads(body)
            game = get_object_or_404(Game, slug=data["game_slug"])
            player_score = Score.objects.filter(user=request.user, game=game)
            player_high_score = player_score.aggregate(Max('score'))['score__max'] or 0
            return JsonResponse({"is_authenticated": True, "username": request.user.username, "highest_score": player_high_score}, safe=False)
        return JsonResponse({"is_authenticated": False}, safe=False)
    return redirect('home')

def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({'csrfToken': token})

def high_score_js(request):
    static_dir = settings.STATIC_ROOT
    high_score_js_path = os.path.join(static_dir, 'api', 'high-score.js')
    with open(high_score_js_path, 'rb') as high_score_js_file:
        response = HttpResponse(content=high_score_js_file.read(), content_type='application/javascript')
    return response
