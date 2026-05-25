from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Personalización del panel de administración
admin.site.site_header = "Melani's Sweet Creations — Panel de Administración"
admin.site.site_title = "Melani's Sweet Creations"
admin.site.index_title = "Gestión de la Pastelería"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("tienda.urls")),
]

# Servir archivos de medios en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
