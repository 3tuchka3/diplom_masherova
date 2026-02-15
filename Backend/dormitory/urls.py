from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResidentCardViewSet, TariffViewSet

router = DefaultRouter()
router.register(r'cards', ResidentCardViewSet)
router.register(r'tariffs', TariffViewSet)


urlpatterns = [
    path('', include(router.urls)),
]