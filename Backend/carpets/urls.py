from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CarpetViewSet # Импортируем вьюсет ковров

router = DefaultRouter()
router.register(r'items', CarpetViewSet) # Будет доступно по адресу /api/carpets/items/

urlpatterns = [
    path('', include(router.urls)),
]