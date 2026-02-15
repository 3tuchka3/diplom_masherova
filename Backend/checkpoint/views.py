from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import VehicleRecord
from .serializers import VehicleRecordSerializer
from accounts.permissions import IsCheckpointOfficer # Импортируем наш фильтр
from rest_framework.permissions import IsAuthenticated

class VehicleRecordViewSet(viewsets.ModelViewSet):
    queryset = VehicleRecord.objects.all()
    serializer_class = VehicleRecordSerializer

    permission_classes = [IsAuthenticated, IsCheckpointOfficer]

    # Метод для кнопки "Выпустить"
    @action(detail=True, methods=['post'])
    def exit(self, request, pk=None):
        record = self.get_object()
        if record.exit_time:
            return Response({'error': 'Машина уже выехала'}, status=status.HTTP_400_BAD_REQUEST)

        record.exit_time = timezone.now()
        record.save()
        return Response({'status': 'Выезд зафиксирован', 'exit_time': record.exit_time})