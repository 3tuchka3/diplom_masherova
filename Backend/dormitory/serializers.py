from rest_framework import serializers
from .models import ResidentCard, MonthlyPayment, Tariff


class MonthlyPaymentSerializer(serializers.ModelSerializer):
    total = serializers.ReadOnlyField(source='total_amount')

    class Meta:
        model = MonthlyPayment
        fields = '__all__'
        # Это предотвратит ошибку "Поля card, month должны производить массив с уникальными значениями"
        extra_kwargs = {
            'card': {'required': False},
            'month': {'required': True},
        }
        validators = []  # Очищаем валидаторы уникальности для вложенной записи


class ResidentCardSerializer(serializers.ModelSerializer):
    payments = MonthlyPaymentSerializer(many=True, required=False)

    class Meta:
        model = ResidentCard
        fields = [
            'id', 'full_name', 'account_number', 'year',
            'room_number', 'total_area', 'living_area',
            'family_count', 'dog_count', 'payments'
        ]

    def create(self, validated_data):
        # Извлекаем платежи из данных
        payments_data = validated_data.pop('payments', [])
        # Создаем карточку (метод save в модели сам создаст 12 пустых строк в БД)
        instance = ResidentCard.objects.create(**validated_data)

        # Обновляем созданные пустые записи теми данными, что пришли с фронта
        if payments_data:
            for payment_data in payments_data:
                month = payment_data.get('month')
                MonthlyPayment.objects.filter(card=instance, month=month).update(**payment_data)

        return instance

    def update(self, instance, validated_data):
        payments_data = validated_data.pop('payments', None)
        instance = super().update(instance, validated_data)

        if payments_data is not None:
            for payment_data in payments_data:
                # ВАЖНО: используем 'card' вместо 'resident_card'
                # так как именно так поле называется в модели
                month = payment_data.get('month')
                MonthlyPayment.objects.update_or_create(
                    card=instance,  # ИМЯ ПОЛЯ В МОДЕЛИ
                    month=month,
                    defaults=payment_data
                )
        return instance


class TariffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tariff
        fields = '__all__'
