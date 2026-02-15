from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import ResidentCard, Tariff
from .serializers import ResidentCardSerializer, TariffSerializer
from accounts.permissions import IsDormManager # Наш новый фильтр



class TariffViewSet(viewsets.ModelViewSet):
    queryset = Tariff.objects.all()
    serializer_class = TariffSerializer
    permission_classes = [IsAuthenticated, IsDormManager]


class ResidentCardViewSet(viewsets.ModelViewSet):
    queryset = ResidentCard.objects.all()
    serializer_class = ResidentCardSerializer
    pagination_class = None  # <-- ДОБАВЬ ЭТУ СТРОКУ
    # Включаем проверку: только авторизованные пользователи
    permission_classes = [IsAuthenticated, IsDormManager]

    def get_queryset(self):
        # Используем .all() прямо здесь, чтобы избежать кэширования старого списка
        queryset = ResidentCard.objects.all().order_by('-year', 'full_name')
        year = self.request.query_params.get('year')
        if year:
            queryset = queryset.filter(year=year)
        return queryset