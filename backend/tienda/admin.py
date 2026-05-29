from django.contrib import admin
from django.http import HttpResponseRedirect
from django.urls import reverse

from .models import Categoria, Marca, Producto, ImagenGaleria, Configuracion, ComponentePC

# Mapeo nombre de categoría (normalizado) → tipo ComponentePC
CATEGORIA_TIPO_MAP = {
    "procesadores": "CPU",
    "procesador": "CPU",
    "placas madre": "PLACA",
    "placa madre": "PLACA",
    "memoria ram": "RAM",
    "memorias ram": "RAM",
    "ram": "RAM",
    "tarjetas de video": "GPU",
    "tarjeta de video": "GPU",
    "gpu": "GPU",
    "almacenamiento": "ALMACENAMIENTO",
    "almacenamientos": "ALMACENAMIENTO",
    "fuentes de poder": "FUENTE",
    "fuente de poder": "FUENTE",
    "gabinetes": "CASE",
    "gabinete": "CASE",
    "monitores": "MONITOR",
    "monitor": "MONITOR",
    "teclados": "TECLADO",
    "teclado": "TECLADO",
    "mouse": "MOUSE",
    "auriculares": "AURICULARES",
    "mousepads": "MOUSEPAD",
    "mousepad": "MOUSEPAD",
    "ups": "UPS",
    "microfonos": "MICROFONO",
    "microfono": "MICROFONO",
    "micrófono": "MICROFONO",
    "micrófonos": "MICROFONO",
    "camaras web": "CAMARA",
    "camara web": "CAMARA",
    "cámara web": "CAMARA",
    "cámaras web": "CAMARA",
}


class ImagenGaleriaInline(admin.TabularInline):
    model = ImagenGaleria
    extra = 2
    fields = ("imagen", "orden")


class ComponentePCInline(admin.StackedInline):
    model = ComponentePC
    extra = 0
    max_num = 1

    class Media:
        js = ("admin/js/componentepc_fields.js",)


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "icono", "descripcion")
    search_fields = ("nombre",)


@admin.register(Marca)
class MarcaAdmin(admin.ModelAdmin):
    list_display = ("nombre",)
    search_fields = ("nombre",)


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = (
        "nombre", "categoria", "marca", "precio_usd", "precio_soles",
        "stock", "es_nuevo", "es_oferta", "creado",
    )
    list_editable = ("precio_usd", "precio_soles", "stock", "es_nuevo", "es_oferta")
    list_filter = ("categoria", "marca", "es_nuevo", "es_oferta", "consultar_disponibilidad")
    search_fields = ("nombre", "descripcion")
    inlines = [ImagenGaleriaInline, ComponentePCInline]
    list_per_page = 20

    def _tipo_para_producto(self, producto):
        if not producto.categoria:
            return None
        return CATEGORIA_TIPO_MAP.get(producto.categoria.nombre.lower().strip())

    def _redirigir_a_componente(self, request, obj):
        tipo = self._tipo_para_producto(obj)
        if not tipo:
            return None
        if ComponentePC.objects.filter(producto=obj).exists():
            return None
        self.message_user(
            request,
            f'Producto "{obj.nombre}" guardado. Completa ahora los datos del componente PC.',
        )
        url = reverse("admin:tienda_componentepc_add")
        return HttpResponseRedirect(f"{url}?producto={obj.pk}&tipo={tipo}")

    def response_add(self, request, obj, post_url_continue=None):
        if "_continue" not in request.POST and "_addanother" not in request.POST:
            redirect = self._redirigir_a_componente(request, obj)
            if redirect:
                return redirect
        return super().response_add(request, obj, post_url_continue)

    def response_change(self, request, obj):
        if "_continue" not in request.POST and "_addanother" not in request.POST:
            redirect = self._redirigir_a_componente(request, obj)
            if redirect:
                return redirect
        return super().response_change(request, obj)


@admin.register(Configuracion)
class ConfiguracionAdmin(admin.ModelAdmin):
    list_display = ("nombre_tienda", "whatsapp", "instagram", "facebook")

    def has_add_permission(self, request):
        return not Configuracion.objects.exists()


@admin.register(ComponentePC)
class ComponentePCAdmin(admin.ModelAdmin):
    list_display = ("producto", "tipo", "socket_compatible", "tipo_ram_compatible", "watts_recomendados", "form_factor")
    list_filter = ("tipo",)
    search_fields = ("producto__nombre",)

    class Media:
        js = ("admin/js/componentepc_fields.js",)

    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        if "producto" in request.GET:
            initial["producto"] = request.GET["producto"]
        if "tipo" in request.GET:
            initial["tipo"] = request.GET["tipo"]
        return initial
