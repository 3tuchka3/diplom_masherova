from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Дополнительные поля для сотрудника
    middle_name = models.CharField(max_length=150, blank=True, verbose_name="Отчество")
    position = models.CharField(max_length=100, blank=True, verbose_name="Должность")

    # Роли (права доступа к модулям)
    is_dorm_manager = models.BooleanField(default=False, verbose_name="Доступ: Общежитие")
    is_checkpoint_officer = models.BooleanField(default=False, verbose_name="Доступ: КПП")
    is_carpet_admin = models.BooleanField(default=False, verbose_name="Доступ: Каталог ковров")
    is_active = models.BooleanField(default=False, verbose_name="Активен (одобрен)")  # Добавь это

    class Meta:
        verbose_name = "Сотрудник"
        verbose_name_plural = "Сотрудники"

    def __str__(self):
        # Выводит ФИО или логин
        full_name = f"{self.last_name} {self.first_name} {self.middle_name}".strip()
        return full_name if full_name else self.username