from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import login, logout, authenticate
from django.core.mail import send_mail, mail_admins
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.dispatch import receiver
from django.db.models import Count
from django.contrib import messages
from .models import *
from .utils import *
import os
from sendfile import sendfile
import mimetypes
from edgegames import settings
import math

def home(request):
    games = Game.objects.filter(is_approved=True)
    popular_games = Game.objects.filter(is_approved=True).annotate(num_views=Count('views')).order_by('-num_views')[:5]
    trending_games = Game.objects.filter(is_approved=True).annotate(num_views=Count('views')).order_by('-num_views')[:5]
    return render(request, 'main/index.html', {"pages": [{"heading": "Popular", "data": popular_games}, {"heading": "Trending", "data": trending_games}, {"heading": "All Games", "data": games}]})

def test(request):
    return render(request, "main/game-approved-email.html", {"username": request.user.username, "game": "Space Inaders"})
    
def upload_game(request):
    if request.method == 'POST' and request.user.is_authenticated:

        uploaded_files = request.FILES.getlist('game-files')
        game_images = request.FILES.getlist('game-images')
        profile_pic = request.FILES.get('game-profile-pic')

        game = Game.objects.create(
            title=request.POST['game-title'],
            description=request.POST['game-description'],
            developer=request.user,
            is_available_on_mobile = request.POST.get('is_mobile') == "yes",
            is_available_on_tablet = request.POST.get('is_tablet') == "yes",
            is_available_on_desktop = request.POST.get('is_pc') == "yes",
        )
        
        game.save()
        game.profile_picture = profile_pic
        game.save()
        game.developer.user_account.is_developer = True
        game.developer.user_account.save()

        for file in uploaded_files:
            game_file = GameFile.objects.create(file=file, game=game)
            game_file.save()

        for image in game_images:
            game_image = ImageFile.objects.create(image=image, game=game)
            game_image.save()

        mail_admins(f'{game.developer.username} just Uploaded a new Game', f'title: {game.title}, description: {game.description}', False)
        html_mail = render_to_string('main/game-upload-successfull-email.html', {"username": game.developer.username, "today": game.created_at, "slug": game.slug})
        send_mail('Game Upload Success!', '', settings.EMAIL_HOST_USER, [game.developer.email], html_message=html_mail, fail_silently=True)
        
        if request.user.user_account.about == None or request.user.user_account.profile_pic == None:
            messages.success(request, "Your game was uploaded successfully. It will appear in the feed when it is approved by our reviewers. Meanwhile we reccomend you to complete your profile!")
            return redirect(reverse('developer_profile', args=[request.user.username]))    
        messages.success(request, "Your game was uploaded successfully. It will appear in the feed when it is approved by our reviewers!")
        return redirect(reverse('game_view', args=[game.slug]))
    else:
        return HttpResponse("Invalid Method")

def faviorates_view(request):
    if request.user.is_authenticated:
        account = Account.objects.get(user=request.user)
        faviorate_games = account.faviorates.all()
        if len(faviorate_games) > 0:
            return render(request, "main/index.html", {"pages": [{"heading": "Your Faviorates", "data": faviorate_games}]})
        return render(request, 'main/error_photo.html', {"heading": "No Faviorates", "title": "You have not added any game to you faviorates!", "sub_title": "Add some games to your faviorates"})
    else:
        return render(request, 'main/error_photo.html', {"heading": "You are not Logged In!", "title": "To see your faviorates please Log In", "sub_title": ""})

def update_game(request):
    game = Game.objects.get(id=request.POST.get("game_id"))
    if request.method == "POST" and request.user == game.developer:
        game.description = request.POST.get('game-description')
        game.is_available_on_mobile = request.POST.get('is_mobile') == "yes"
        game.is_available_on_tablet = request.POST.get('is_tablet') == "yes"
        game.is_available_on_desktop = request.POST.get('is_pc') == "yes"
        game.profile_picture.delete(save=False)

        game.profile_picture = request.FILES.get('game-profile-pic')
        uploaded_files = request.FILES.getlist('game-files')
        game_images = request.FILES.getlist('game-images')

        for game_file in game.gamefile_set.all():
            game_file.file.delete(save=False)

        for image in game.imagefile_set.all():
            image.image.delete(save=False)

        for file in uploaded_files:
            game_file = GameFile.objects.create(file=file, game=game)
            game_file.save()

        for image in game_images:
            game_image = ImageFile.objects.create(image=image, game=game)
            game_image.save()

        game.save()
        messages.success(request, "your game has been updated successfully!")
        return redirect(reverse('game_view', args=[game.slug]))
    else:
        return redirect(reverse('home'))

@receiver(pre_delete, sender=Game)
def game_delete(sender, instance, **kwargs):
    instance.profile_picture.delete(save=False)

    for game_file in instance.gamefile_set.all():
        game_file.file.delete(save=False)
    for image in instance.imagefile_set.all():
        image.image.delete(save=False)

def delete_game(request):
    game_id = request.POST.get("game_id")
    game = get_object_or_404(Game, id=game_id)
    if request.method == "POST" and request.user == game.developer:
        game.delete()
        messages.success(request, f"{game.title} was deleted successfully!")
    return redirect(reverse('home'))
    
def update_game_view(request, game_slug):
    game = Game.objects.get(slug = game_slug)
    if request.user == game.developer:
        return render(request, 'main/update_game.html', {"game": game})
    else:
        return redirect(reverse('home'))

def serve_game(request, game_slug):
    game = get_object_or_404(Game, slug=game_slug)
    game_files = game.gamefile_set.all()

    if (request.user_agent.is_mobile and game.is_available_on_mobile) or (request.user_agent.is_pc and game.is_available_on_desktop) or (request.user_agent.is_tablet and game.is_available_on_tablet):
        game_html = None
        for game_file in game_files:
            if game_file.file.name == f"games/{game.id}/index.html":
                game_html = game_file.file

        if game_html:
            if game.is_approved or request.user == game.developer or request.user.is_superuser:
                with game_html.open() as f:
                    contents = f.read()

                ip = get_client_ip(request)
                if IpModel.objects.filter(ip=ip).exists():
                    game.views.add(IpModel.objects.get(ip=ip))
                else:
                    IpModel.objects.create(ip=ip)
                    game.views.add(IpModel.objects.get(ip=ip))
                
                return HttpResponse(contents, content_type='text/html')
            else:
                return render(request, 'main/error_screen.html', {"status_code": "Not Allowed", "heading": "This game hasn't been approved yet!", "sub_heading": "If you are the developer of the game then please sign in with the account you uploaded the game with"})
        else:
            return HttpResponse("HTML file not found")
    else:
        user_devices = {"Mobile": request.user_agent.is_mobile, "Tablet": request.user_agent.is_tablet, "Desktops": request.user_agent.is_pc}
        game_devices = {"Mobile": game.is_available_on_mobile, "Tablet": game.is_available_on_tablet, "Desktop": game.is_available_on_desktop}
        user_device = next((key for key, value in user_devices.items() if value), "None")
        true_devices = [key for key, value in game_devices.items() if value]
        if len(true_devices) > 0:
            return render(request, 'main/error_screen.html', {"status_code": "Not Allowed", "heading": f"This game is not available for {user_device}!", "sub_heading": "Kindly try again with a " + ', '.join(true_devices[:-1]) + " or a " + true_devices[-1] if len(true_devices) > 1 else "Kindly try again with a " + true_devices[0]})
        else:
            return render(request, 'main/error_screen.html', {"status_code": "Not Allowed", "heading": f"This game is not available on any device!", "sub_heading": mark_safe(f"Kindly contact the developer at <a href='mailto:{game.developer.email}'class='text-blue-500 cursor-pointer hover:underline'>{game.developer.email}</a>")})

def serve_game_file(request, game_slug, file_name):
    game = get_object_or_404(Game, slug=game_slug)
    game_files = game.gamefile_set.all()
    for game_file in game_files:
        if game_file.file.name == f"games/{game.id}/{file_name}":
            file_path = os.path.join(settings.MEDIA_ROOT, 'games', str(game.id), file_name)
            mimetype = mimetypes.guess_type(file_path)[0]
        
            return sendfile(request, file_path, mimetype=mimetype)
    return render(request, 'main/error_screen.html', {"status_code": "Not Found", "heading": f"No file with the name {file_name} was found", "sub_heading": "Kindly double check the link"})

def serve_game_img(request, game_slug, img_name):
    game = get_object_or_404(Game, slug=game_slug)
    images = game.imagefile_set.all()
    for image in images: 
        if image.image.name == f"images/{game.id}/{img_name}":
            img_path = os.path.join(settings.MEDIA_ROOT, 'images', str(game.id), img_name)
            mimetype = mimetypes.guess_type(img_path)[0]
            return sendfile(request, img_path, mimetype=mimetype)
    return HttpResponse("No Image found!")

def serve_game_profile_pic(request, game_slug):
    game = get_object_or_404(Game, slug=game_slug)
    image = game.profile_picture
    image_name = image.name.split('/')[-1]
    image_path = os.path.join(settings.MEDIA_ROOT, 'profile_pics', str(game.id), image_name)
    mimetype = mimetypes.guess_type(image_path)[0]
    return sendfile(request, image_path, mimetype=mimetype)

def serve_user_profile_pic(request, username):
    user = get_object_or_404(User, username=username)
    account = Account.objects.get(user=user)
    image = account.profile_pic
    image_name = image.name.split('/')[-1]
    image_path = os.path.join(settings.MEDIA_ROOT, 'user_profile_pics', str(user.id), image_name)
    mimetype = mimetypes.guess_type(image_path)[0]
    return sendfile(request, image_path, mimetype=mimetype)

def handle_login(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, "Successfully Logged In!")
        else:
            messages.success(request, "Incorrect Username or Password!")
            return redirect(reverse('login'))
    return redirect(reverse('home'))

def handle_signup(request):
    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("password")
        user = User.objects.create_user(username, email, password)
        account = Account.objects.create(user=user)
        account.save()
        login(request, user)
        messages.success(request, "Your Edge Games account was created successfully!")
    return redirect(reverse('home'))

def signingup(request):
    if request.method == "POST":
        type = request.POST['type']
        if type == 'username':
            username = request.POST['username']
            if User.objects.filter(username=username).exists():
                data = {'status': 'error', "message": "Username already exists!", "username": username}
            elif username == "":
                data = {'status': 'error', "message": "Username cannot be empty", "username": username}
            elif len(username) < 3:
                data = {'status': 'error', "message": "Username must be at least 3 characters", "username": username}
            elif len(username) > 16:
                data = {'status': 'error', "message": "Username must be less than 16 characters", "username": username}
            else:
                data = {'status': 'success', "message": "Username is available!", "username": username}
            return JsonResponse(data, safe=False)
    else:
        return redirect('/signup')

def handle_logout(request):
    if request.method == "POST":
        path = request.POST.get('path')
        logout(request)
        messages.success(request, "Successfully Logged Out!")
    return redirect(path)

def game_view(request, game_slug):
    game = get_object_or_404(Game, slug=game_slug)
    reviews = Review.objects.filter(game=game)
    total_stars = 0
    profile_pic = game.profile_picture.url
    for review in reviews:
        total_stars += review.stars
    user_review = Review.objects.filter(user=request.user, game=game).first() if request.user.is_authenticated else None
    has_reviewed = True if user_review != None else False
    review_count = reviews.count() if reviews.count() != 0 else 1
    avg_stars = round(total_stars/review_count, 2)
    review_stars = round(avg_stars)
    views = game.get_views()
    if request.user.is_authenticated:
        account = Account.objects.get(user=request.user)
        is_faviorate = game in account.faviorates.all()
    else:
        is_faviorate = False

    images = game.imagefile_set.all()
    img_names = []
    for image in images:
        img_names.append(image.image.name.split('/')[-1])

    games = Game.objects.filter(is_approved=True)
    stars_1 = reviews.filter(stars=1).count(); stars_2 = reviews.filter(stars=2).count(); stars_3 = reviews.filter(stars=3).count(); stars_4 = reviews.filter(stars=4).count(); stars_5 = reviews.filter(stars=5).count();
    stars_1_perc = math.ceil(stars_1*100/review_count); stars_2_perc = math.ceil(stars_2*100/review_count); stars_3_perc = math.ceil(stars_3*100/review_count); stars_4_perc = math.ceil(stars_4*100/review_count); stars_5_perc = math.ceil(stars_5*100/review_count);
    star_percentages = {"star_1": stars_1_perc, "star_2": stars_2_perc, "star_3": stars_3_perc, "star_4": stars_4_perc, "star_5": stars_5_perc}
    star_info = {"total_stars": total_stars, "review_count": review_count, "avg_stars": avg_stars, "review_stars": review_stars, "stars_percentages": star_percentages}
    data = {"game": game, "reviews": reviews, "star_info": star_info, "views": views, "img_names": img_names, "profile_pic": profile_pic, "games": games, "user_review": user_review, "has_reviewed": has_reviewed, "is_faviorate": is_faviorate}
    return render(request, 'main/game_view.html', data)

def post_review(request):
    if request.method == "POST":
        game_id = request.POST['game_id']
        comment = request.POST['comment']
        stars = request.POST['stars']
        game = Game.objects.get(id=game_id)
        review = Review.objects.create(game=game, user=request.user, stars=stars, comment=comment)
        review.save()
        messages.success(request, "Your Review was Posted Successfully!")
        return redirect(reverse('game_view', args=[game.slug]))
    else:
        return redirect(reverse('home'))

def edit_review(request):
    if request.method == "POST":
        review_id = request.POST.get('review_id')
        review = get_object_or_404(Review, id=review_id)
        game = review.game
        if request.user == review.user:
            comment = request.POST.get('comment')
            stars = request.POST.get('stars')
            review.comment = comment
            review.stars = stars
            review.is_edited = True
            review.save()
            messages.success(request, "Your Review was Edited Successfully!")
        return redirect(reverse('game_view', args=[game.slug]))
    else:
        return redirect(reverse('home'))

def delete_review(request):
    if request.method == "POST":
        review_id = request.POST.get('review_id')
        review = get_object_or_404(Review, id=review_id)
        game = review.game
        if request.user == review.user:
            review.delete()
            messages.success(request, "Your Review was Deleted Successfully!")
        return redirect(reverse('game_view', args=[game.slug]))
    else:
        return redirect(reverse('home'))

def add_faviorate(request):
    if request.method == "POST":
        if request.user.is_authenticated:
            game_id = request.POST['game_id']
            game = Game.objects.get(id=game_id)
            account = Account.objects.get(user=request.user)
            if game in account.faviorates.all():
                account.faviorates.remove(game)
                data = {"status": "Ok", "removed": True, "message": ""}
            else:
                account.faviorates.add(game)
                data = {"status": "Ok", "removed": False, "message": ""}
            account.save()
        else:
            data = {"status": "error", "message": "You must be logged in to add a game to your faviorates!"}
        return JsonResponse(data=data, safe=False)
    else:
        return redirect(reverse('home'))

def handle_feedback(request):
    if request.method == "POST":
        email = request.user.email if request.user.is_authenticated else request.POST.get("email")
        subject = request.POST.get("subject")
        message = request.POST.get("message")
        mail_admins(subject=f'{email} just submitted feedback on Edge Games', message=f"email: {email}, subject: {subject}, message: {message}", fail_silently=True)
        messages.success(request, "Your Feedback was Submited Successfully with the Devolopers!")
    return redirect(reverse('home'))

def developer_profile(request, developer_name):
    user = get_object_or_404(User, username=developer_name)
    account = get_object_or_404(Account, user=user)
    if account.is_developer:
        games = Game.objects.filter(developer=user) if request.user == user else Game.objects.filter(developer=user, is_approved=True)
        review_count, stars = 0, 0
        for game in games:
            reviews = Review.objects.filter(game=game)
            for review in reviews:
                stars += review.stars
                review_count += 1
        avg_stars = 0 if review_count == 0 else round(stars/review_count, 1)
        return render(request, "main/developer_profile.html", {"developer": user, "developer_account": account, "games": games, "review_count": review_count, "avg_stars": avg_stars})
    messages.success(request, f"{user.username} is not a developer!")
    return redirect(reverse('home'))

def edit_profile(request):
    if request.user.is_authenticated:
        account = Account.objects.get(user=request.user)
        if account.is_developer:
            return render(request, 'main/edit_profile.html', {"developer": request.user, "developer_account": account})
    return redirect(reverse('home'))

def handle_developer_profile(request):
    developer_id = request.POST.get('developer_id')
    developer = get_object_or_404(User, id=developer_id)
    if request.method == "POST" and request.user == developer:
        developer_profile_pic = request.FILES.get('developer_profile_pic')
        developer_about = request.POST.get('developer_about')
        instagram_link = request.POST.get('instagram-link')
        twitter_link = request.POST.get('twitter-link')
        linkedin_link = request.POST.get('linkedin-link')
        github_link = request.POST.get('github-link')
        account = Account.objects.get(user=developer)
        account.profile_pic = developer_profile_pic
        account.about = developer_about
        account.instagram_link = instagram_link or None
        account.twitter_link = twitter_link or None
        account.linkedin_link = linkedin_link or None
        account.github_link = github_link or None
        account.save()
        messages.success(request, "Your profile was updated successfully!")
        return redirect(reverse('developer_profile', args=[developer.username]))
    return redirect(reverse('home'))

def approve_game(request):
    if request.method == "POST":
        if request.user.is_superuser:
            game_id = request.POST.get('game_id')
            game = Game.objects.get(id=game_id)
            game.is_approved = True
            game.save()
            html_mail = render_to_string('main/game-approved-email.html', {"username": game.developer.username, "game": game.title})
            send_mail(f"{ game.title } has been approved!", '', settings.EMAIL_HOST_USER, [game.developer.email], html_message=html_mail, fail_silently=True)
            messages.success(request, f"{game.title} has been approved!")
    return redirect(reverse('home'))
    

def approvals(request):
    if request.user.is_superuser:
        games = Game.objects.filter(is_approved=False)
        return render(request, 'main/approvals.html', {"games": games})
    return redirect(reverse('home'))
    
#Rendering Views
def upload_game_view(request):
    if request.user.is_authenticated:
        return render(request, 'main/add_game.html')
    else:
        return redirect(reverse('home'))

def login_view(request):
    return render(request, 'main/login.html')

def signup_view(request):
    return render(request, 'main/signup.html')

def feedback(request):
    return render(request, "main/feedback.html")

def about(request):
    return render(request, "main/about.html")

def support(request):
    return render(request, "main/support.html")

def terms_and_conditions(request):
    return render(request, "main/terms-and-conditions.html")

def privacy_policy(request):
    return render(request, "main/privacy-policy.html")
