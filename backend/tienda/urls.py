from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoriaViewSet,
    MarcaViewSet,
    ProductoViewSet,
    ConfiguracionViewSet,
    ComponentePCViewSet,
    seed_view,
)

router = DefaultRouter()
router.register(r"categorias", CategoriaViewSet)
router.register(r"marcas", MarcaViewSet)
router.register(r"productos", ProductoViewSet, basename="producto")
router.register(r"configuracion", ConfiguracionViewSet)
router.register(r"componentes", ComponentePCViewSet, basename="componente")

urlpatterns = [
    path("", include(router.urls)),
    path("seed/", seed_view),
]
