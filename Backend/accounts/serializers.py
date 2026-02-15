from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'first_name', 'last_name', 'middle_name', 'position')

    def create(self, validated_data):
        # Создаем пользователя, но БЕЗ прав доступа и НЕАКТИВНЫМ
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            middle_name=validated_data.get('middle_name', ''),
            position=validated_data.get('position', ''),
            is_active=False # Ждет одобрения админа
        )
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Добавляем данные о ролях в токен
        token['username'] = user.username
        token['position'] = user.position
        token['is_dorm_manager'] = user.is_dorm_manager
        token['is_checkpoint_officer'] = user.is_checkpoint_officer
        token['is_carpet_admin'] = user.is_carpet_admin

        return token