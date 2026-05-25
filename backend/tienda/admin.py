from django.contrib import admin
from .models import Categoria, Marca, Producto, ImagenGaleria, Configuracion, ComponentePC


class ImagenGaleriaInline(admin.TabularInline):
    model = ImagenGaleria
    extra = 2
    fields = ("imagen", "orden")


class ComponentePCInline(admin.StackedInline):
    model = ComponentePC
    extra = 0
    max_num = 1


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


@admin.register(Configuracion)
class ConfiguracionAdmin(admin.ModelAdmin):
    list_display = ("nombre_tienda", "whatsapp", "instagram", "facebook")

    def has_add_permission(self, request):
        return not Configuracion.objects.exists()


@admin.register(ComponentePC)
class ComponentePCAdmin(admin.ModelAdmin):
    list_display = ("producto", "tipo", "socket_compatible", "tipo_ram_compatible")
    list_filter = ("tipo",)
    search_fields = ("producto__nombre",)
