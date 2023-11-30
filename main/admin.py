from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *

# Register your models here.

admin.site.register((Game, GameFile, ImageFile, Review, IpModel, FAQ))

class AccountInLine(admin.StackedInline):
    model = Account
    can_delete = False
    verbose_name_plural = 'Accounts'

class CustomizedUserAdmin(UserAdmin):
    inlines = (AccountInLine, )
    
admin.site.unregister(User)
admin.site.register(User, CustomizedUserAdmin)
