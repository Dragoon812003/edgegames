from django.urls import path, include
from django.conf.urls.static import static
from .views import *

urlpatterns = [
    path('', home, name="home"),
    path('handle-upload-game', upload_game, name="upload_game"),
    path('games/<str:game_slug>/play', serve_game, name='serve_game'),
    path('file/<slug:game_slug>/<path:file_name>', serve_game_file, name='serve_game_file'),
    # path('game-upload-next/<str:game_slug>', game_upload_next, name="game_upload_next"), 
    path('login', login_view, name="login"),
    path('signup', signup_view, name="signup"),
    path('signingup', signingup, name="signingup"),
    path('handle-login', handle_login, name="handle_login"),
    path('handle-signup', handle_signup, name="handle_signup"),
    path('handle-logout', handle_logout, name="handle_logout"),
    path('upload-game', upload_game_view, name="upload_game_view"),
    path('delete-game', delete_game, name="delete_game"),
    path('games/<slug:game_slug>', game_view, name="game_view"),
    path('review-post', post_review, name="post_review"),
    path('edit-review', edit_review, name="edit_review"),
    path('delete-review', delete_review, name="delete_review"),
    path('add-faviorate', add_faviorate, name="add_faviorate"),
    path('update-game', update_game, name="update_game"),
    path('games/<slug:game_slug>/update', update_game_view, name="update_game_view"),
    path('developer/<str:developer_name>', developer_profile, name="developer_profile"),
    path('edit-profile', edit_profile, name="edit_profile"),
    path('handle-developer-profile', handle_developer_profile, name="handle_developer_profile"),
    path('handle_feedback', handle_feedback, name="handle_feedback"),
    path('faviorates', faviorates_view, name="faviorates_view"),
    path('feedback', feedback, name="feedback"),
    path('about', about, name="about"),
    path('support', support, name="support"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)