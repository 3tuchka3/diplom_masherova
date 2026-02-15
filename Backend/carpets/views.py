from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import Carpet
from .serializers import CarpetSerializer
from accounts.permissions import IsCarpetAdmin
from rest_framework.permissions import IsAuthenticated

class CarpetViewSet(viewsets.ReadOnlyModelViewSet): # Только чтение, так как импорт у нас ручной
    queryset = Carpet.objects.all()
    serializer_class = CarpetSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['design', 'color', 'palette', 'size'] # Поля, по которым можно фильтровать
    permission_classes = [IsAuthenticated, IsCarpetAdmin]