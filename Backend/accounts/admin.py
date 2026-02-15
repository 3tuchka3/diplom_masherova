from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class MyUserAdmin(UserAdmin):
    # Добавляем новые поля в форму редактирования пользователя в админке
    fieldsets = UserAdmin.fieldsets + (
        ('Дополнительная информация', {'fields': ('middle_name', 'position')}),
        ('Права доступа к модулям', {'fields': ('is_dorm_manager', 'is_checkpoint_officer', 'is_carpet_admin')}),
    )
    # Добавляем колонки в список всех пользователей
    list_display = ['username', 'email', 'position', 'is_active', 'is_staff']