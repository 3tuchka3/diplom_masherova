from rest_framework import serializers
from .models import VehicleRecord, VehiclePhoto, VehicleDocument

class VehiclePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehiclePhoto
        fields = ['id', 'image']

class VehicleDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleDocument
        fields = ['id', 'file']

class VehicleRecordSerializer(serializers.ModelSerializer):
    # Оставляем их для вывода (чтения)
    photos = VehiclePhotoSerializer(many=True, read_only=True)
    documents = VehicleDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = VehicleRecord
        fields = [
            'id', 'car_number', 'car_brand', 'driver_name',
            'organization', 'entry_time', 'exit_time',
            'photos', 'documents'
        ]

    # ДОБАВЛЯЕМ ЭТОТ МЕТОД
    def create(self, validated_data):
        # Получаем список файлов из запроса
        # Мы используем request.FILES, так как файлы не попадают в validated_data из-за read_only
        request = self.context.get('request')
        photos_data = request.FILES.getlist('photos')
        docs_data = request.FILES.getlist('documents')

        # Создаем основную запись (машину)
        vehicle_record = VehicleRecord.objects.create(**validated_data)

        # Сохраняем фотографии
        for photo in photos_data:
            VehiclePhoto.objects.create(record=vehicle_record, image=photo)

        # Сохраняем документы
        for doc in docs_data:
            VehicleDocument.objects.create(record=vehicle_record, file=doc)

        return vehicle_record