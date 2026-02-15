from django.contrib import admin
from .models import ResidentCard, MonthlyPayment, Tariff

class MonthlyPaymentInline(admin.TabularInline):
    model = MonthlyPayment
    extra = 12  # Сразу создаст 12 строк для заполнения
    max_num = 12

@admin.register(ResidentCard)
class ResidentCardAdmin(admin.ModelAdmin):
    list_display = ('account_number', 'full_name', 'year', 'room_number')
    list_filter = ('year', 'room_number')
    search_fields = ('full_name', 'account_number')
    inlines = [MonthlyPaymentInline]

@admin.register(Tariff)
class TariffAdmin(admin.ModelAdmin):
    # service_name — это ключ (название поля в MonthlyPayment)
    list_display = ('label', 'service_name', 'value', 'unit')
    list_editable = ('value',) # Позволяет менять цифры прямо в списке