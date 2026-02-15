from django.db import models

class Carpet(models.Model): # Проверь это название!
    image = models.ImageField(upload_to='carpets/', verbose_name="Путь к файлу")
    design = models.CharField(max_length=50, verbose_name="Рисунок")
    color = models.CharField(max_length=50, verbose_name="Колорит")
    palette = models.CharField(max_length=50, verbose_name="Палитра")
    size = models.CharField(max_length=50, verbose_name="Размеры")
    extra = models.CharField(max_length=50, blank=True, null=True, verbose_name="Доп. параметр")

    def __str__(self):
        return f"{self.design}x{self.color}x{self.size}"