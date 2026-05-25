from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Personalización del panel de administración
admin.site.site_header = "FENK Computers — Panel de Administración"
admin.site.site_title = "FENK Computers"
admin.site.index_title = "Gestión de la Tienda"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("tienda.urls")),
]

# Servir archivos de medios en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
