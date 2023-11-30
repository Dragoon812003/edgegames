from django.urls import path, include
from .views import *

urlpatterns = [
    path('add-score', add_score, name="add_score"),
    path('get-high-scores/<slug:game_slug>/<int:num>', get_high_scores, name="get_high_scores"),
    path('csrf_token/', get_csrf_token, name='get_csrf_token'),
    path('get-info', get_user_info, name="get_user_info"),
    path('high-score-js', high_score_js, name='high_score_js'),
]