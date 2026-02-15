from django.contrib import admin
from .models import VehicleRecord, VehiclePhoto, VehicleDocument


# Настройка вложенных фото
class VehiclePhotoInline(admin.TabularInline):
    model = VehiclePhoto
    extra = 1  # Сколько пустых полей для фото показывать сразу


# Настройка вложенных документов
class VehicleDocumentInline(admin.TabularInline):
    model = VehicleDocument
    extra = 1


@admin.register(VehicleRecord)
class VehicleRecordAdmin(admin.ModelAdmin):
    list_display = ('car_number', 'car_brand', 'driver_name', 'entry_time', 'exit_time')
    list_filter = ('entry_time', 'exit_time')
    search_fields = ('car_number', 'driver_name', 'organization')

    # Добавляем вложенные модели прямо в форму машины
    inlines = [VehiclePhotoInline, VehicleDocumentInline]