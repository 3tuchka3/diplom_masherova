from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Tariff(models.Model):
    # service_name будет хранить ключи типа 'heating', 'electricity' и т.д.
    service_name = models.CharField(max_length=100, unique=True, verbose_name="Техническое название услуги")
    label = models.CharField(max_length=255, verbose_name="Отображаемое название")
    value = models.DecimalField(max_digits=10, decimal_places=6, default=0, verbose_name="Значение тарифа")
    unit = models.CharField(max_length=50, verbose_name="Ед. изм.")

    class Meta:
        verbose_name = "Тариф"
        verbose_name_plural = "Тарифы" # Исправь на это

    def __str__(self):
        return f"{self.label}: {self.value} {self.unit}"


class ResidentCard(models.Model):
    full_name = models.CharField(max_length=255, verbose_name="ФИО жильца")
    account_number = models.CharField(max_length=50, verbose_name="Лицевой счет")
    year = models.IntegerField(
        validators=[MinValueValidator(2020), MaxValueValidator(2100)],
        verbose_name="Год"
    )
    room_number = models.CharField(max_length=10, verbose_name="Номер комнаты")
    total_area = models.DecimalField(max_digits=7, decimal_places=2, verbose_name="Общая площадь")
    living_area = models.DecimalField(max_digits=7, decimal_places=2, verbose_name="Жилая площадь")
    family_count = models.PositiveIntegerField(default=1, verbose_name="Состав семьи")
    dog_count = models.PositiveIntegerField(default=0, verbose_name="Кол-во собак")

    class Meta:
        verbose_name = "Карточка жильца (год)"
        verbose_name_plural = "Карточки жильцов"
        # Чтобы нельзя было создать две карточки на один и тот же год для одного счета
        unique_together = ('account_number', 'year')

    def __str__(self):
        return f"{self.account_number} | {self.full_name} ({self.year})"

    def save(self, *args, **kwargs):
        is_new = self.pk is None  # Проверяем, создается ли новая карточка
        super().save(*args, **kwargs)

        if is_new:
            # Создаем 12 пустых записей по месяцам
            payments = [
                MonthlyPayment(card=self, month=m) for m in range(1, 13)
            ]
            MonthlyPayment.objects.bulk_create(payments)


class MonthlyPayment(models.Model):
    MONTH_CHOICES = [
        (1, 'Январь'), (2, 'Февраль'), (3, 'Март'), (4, 'Апрель'),
        (5, 'Май'), (6, 'Июнь'), (7, 'Июль'), (8, 'Август'),
        (9, 'Сентябрь'), (10, 'Октябрь'), (11, 'Ноябрь'), (12, 'Декабрь'),
    ]

    card = models.ForeignKey(ResidentCard, on_delete=models.CASCADE, related_name='payments')
    month = models.IntegerField(choices=MONTH_CHOICES, verbose_name="Месяц")

    # 14 видов выплат
    land_tax = models.DecimalField(max_digits=10, decimal_places=4, default=0, verbose_name="Земельный налог")
    rent_payment = models.DecimalField(max_digits=10, decimal_places=4, default=0,
                                       verbose_name="Пользование жилым пом.")
    capital_repair = models.DecimalField(max_digits=10, decimal_places=4, default=0, verbose_name="Кап. ремонт")
    maintenance = models.DecimalField(max_digits=10, decimal_places=4, default=0, verbose_name="Тех. обслуживание")
    heating = models.DecimalField(max_digits=10, decimal_places=4, default=0, verbose_name="Отопление")
    water_sewage = models.DecimalField(max_digits=10, decimal_places=4, default=0, verbose_name="Вода и канализация")
    water_heating = models.DecimalField(max_digits=10, decimal_places=4, default=0, verbose_name="Подогрев воды")
    electricity = models.DecimalField(max_digits=10, decimal_places=4, default=0, verbose_name="Электроэнергия")
    elevator_maintenance = models.DecimalField(max_digits=10, decimal_places=4, default=0, verbose_name="ТО лифта")
    elevator_electricity = models.DecimalField(max_digits=10, decimal_places=4, default=0,
                                               verbose_name="Эл-энергия лифта")
    waste_management = models.DecimalField(max_digits=10, decimal_places=4, default=0, verbose_name="ТКО")
    dog_tax = models.DecimalField(max_digits=10, decimal_places=4, default=0, verbose_name="Содержание собак")
    common_lighting = models.DecimalField(max_digits=10, decimal_places=4, default=0,
                                          verbose_name="Освещение вспом. пом.")
    common_sanitation = models.DecimalField(max_digits=10, decimal_places=4, default=0,
                                            verbose_name="Сан. содерж. вспом. пом.")

    recalculation = models.DecimalField(max_digits=10, decimal_places=4, default=0, verbose_name="Перерасчет")

    class Meta:
        verbose_name = "Ежемесячный платеж"
        verbose_name_plural = "Ежемесячные платежи"
        unique_together = ('card', 'month')  # Один месяц - одна запись в карточке года

    def total_amount(self):
        # Сумма всех полей
        fields = [
            self.land_tax, self.rent_payment, self.capital_repair, self.maintenance,
            self.heating, self.water_sewage, self.water_heating, self.electricity,
            self.elevator_maintenance, self.elevator_electricity, self.waste_management,
            self.dog_tax, self.common_lighting, self.common_sanitation, self.recalculation
        ]
        return sum(fields)
