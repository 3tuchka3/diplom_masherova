from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VehicleRecordViewSet

router = DefaultRouter()
router.register(r'records', VehicleRecordViewSet) # Путь будет /api/checkpoint/records/

urlpatterns = [
    path('', include(router.urls)),
]