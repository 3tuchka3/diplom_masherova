from django.db import models
from django.utils import timezone

# Основная запись о машине
class VehicleRecord(models.Model):
    car_number = models.CharField(max_length=20, verbose_name="Гос. номер")
    car_brand = models.CharField(max_length=50, verbose_name="Марка машины")
    driver_name = models.CharField(max_length=255, verbose_name="ФИО водителя")
    organization = models.CharField(max_length=255, blank=True, null=True, verbose_name="Организация")
    entry_time = models.DateTimeField(default=timezone.now, verbose_name="Время въезда")
    exit_time = models.DateTimeField(null=True, blank=True, verbose_name="Время выезда")

    class Meta:
        verbose_name = "Запись КПП"
        verbose_name_plural = "Журнал КПП"
        ordering = ['-entry_time']

    def __str__(self):
        return f"{self.car_number} ({self.entry_time.strftime('%H:%M')})"

# Модель для нескольких фото
class VehiclePhoto(models.Model):
    record = models.ForeignKey(VehicleRecord, related_name='photos', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='checkpoint/photos/', verbose_name="Фото")

# Модель для нескольких документов
class VehicleDocument(models.Model):
    record = models.ForeignKey(VehicleRecord, related_name='documents', on_delete=models.CASCADE)
    file = models.FileField(upload_to='checkpoint/docs/', verbose_name="Документ (PDF)")