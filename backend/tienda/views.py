import os
from django.core.management import call_command
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import os
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.response import Response
from .models import Categoria, Marca, Producto, Configuracion, ComponentePC
from .serializers import (
    CategoriaSerializer,
    MarcaSerializer,
    ProductoSerializer,
    ProductoDetalleSerializer,
    ConfiguracionSerializer,
    ComponentePCSerializer,
)


class CategoriaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer


class MarcaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer


class ProductoViewSet(viewsets.ReadOnlyModelViewSet):
    def get_queryset(self):
        qs = Producto.objects.select_related("categoria", "marca")
        p = self.request.query_params

        # Multi-category: ?categorias=1,2,3  (overrides single ?categoria)
        if categorias := p.get("categorias"):
            ids = [int(i) for i in categorias.split(",") if i.strip().isdigit()]
            if ids:
                qs = qs.filter(categoria_id__in=ids)
        elif cat := p.get("categoria"):
            qs = qs.filter(categoria_id=cat)
        if marca := p.get("marca"):
            qs = qs.filter(marca_id=marca)
        if p.get("es_nuevo") == "true":
            qs = qs.filter(es_nuevo=True)
        if p.get("es_oferta") == "true":
            qs = qs.filter(es_oferta=True)
        if precio_min := p.get("precio_min"):
            qs = qs.filter(precio_usd__gte=precio_min)
        if precio_max := p.get("precio_max"):
            qs = qs.filter(precio_usd__lte=precio_max)

        orden = p.get("orden", "")
        if orden == "precio_asc":
            qs = qs.order_by("precio_usd")
        elif orden == "precio_desc":
            qs = qs.order_by("-precio_usd")
        elif orden == "nombre":
            qs = qs.order_by("nombre")

        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductoDetalleSerializer
        return ProductoSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = Producto.objects.prefetch_related("galeria").select_related(
            "categoria", "marca"
        ).get(pk=kwargs["pk"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ConfiguracionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Configuracion.objects.all()
    serializer_class = ConfiguracionSerializer

    def list(self, request, *args, **kwargs):
        obj = Configuracion.objects.first()
        if obj:
            return Response(ConfiguracionSerializer(obj).data)
        return Response({})


class ComponentePCViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ComponentePCSerializer

    def get_queryset(self):
        qs = ComponentePC.objects.select_related(
            "producto", "producto__marca", "producto__categoria"
        )
        p = self.request.query_params

        if tipo := p.get("tipo"):
            qs = qs.filter(tipo=tipo)
        if socket := p.get("socket_compatible"):
            qs = qs.filter(socket_compatible=socket)
        if tipo_ram := p.get("tipo_ram_compatible"):
            qs = qs.filter(tipo_ram_compatible=tipo_ram)
        if watts_min := p.get("watts_min"):
            try:
                qs = qs.filter(watts_recomendados__gte=int(watts_min))
            except ValueError:
                pass
        if form_factor := p.get("form_factor"):
            # ATX boards fit only ATX cases; mATX fits mATX/ATX; ITX fits all
            compat = {"ATX": ["ATX"], "mATX": ["mATX", "ATX"], "ITX": ["ITX", "mATX", "ATX"]}
            allowed = compat.get(form_factor, [form_factor])
            qs = qs.filter(form_factor__in=allowed)

        return qs.filter(producto__stock__gt=0)


def debug_env(request):
    import cloudinary
    from django.conf import settings as djsettings
    val = os.environ.get("CLOUDINARY_URL", "")
    cfg = cloudinary.config()
    test_resource = cloudinary.CloudinaryResource("productos/test.avif", default_resource_type="image")
    return JsonResponse({
        "CLOUDINARY_URL_exists": bool(val),
        "CLOUDINARY_URL_preview": val[:30] if val else None,
        "DEFAULT_FILE_STORAGE": getattr(djsettings, "DEFAULT_FILE_STORAGE", None),
        "cloudinary_cloud_name": cfg.cloud_name,
        "cloudinary_api_key_set": bool(cfg.api_key),
        "test_cloudinary_url": test_resource.url,
    })


from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.core.management import call_command
import io

@csrf_exempt
@require_POST
def migrate_images(request):
    secret = os.environ.get("SEED_SECRET", "")
    if not secret or request.headers.get("X-Seed-Key") != secret:
        return JsonResponse({"error": "Forbidden"}, status=403)
    buf = io.StringIO()
    import sys
    old_stdout = sys.stdout
    sys.stdout = buf
    try:
        call_command("migrate_images_to_cloudinary")
    finally:
        sys.stdout = old_stdout
    return JsonResponse({"ok": True, "output": buf.getvalue()})


@csrf_exempt
@require_POST
def seed_view(request):
    secret = os.environ.get("SEED_SECRET", "")
    if not secret or request.headers.get("X-Seed-Key") != secret:
        return JsonResponse({"error": "Forbidden"}, status=403)

    antes = {
        "categorias": Categoria.objects.count(),
        "marcas": Marca.objects.count(),
        "productos": Producto.objects.count(),
        "configuracion": Configuracion.objects.count(),
        "componentes": ComponentePC.objects.count(),
    }

    call_command("loaddata", "datos_iniciales.json", verbosity=0)

    despues = {
        "categorias": Categoria.objects.count(),
        "marcas": Marca.objects.count(),
        "productos": Producto.objects.count(),
        "configuracion": Configuracion.objects.count(),
        "componentes": ComponentePC.objects.count(),
    }

    creados = {k: despues[k] - antes[k] for k in antes}
    return JsonResponse({"ok": True, "totales": despues, "creados": creados})
