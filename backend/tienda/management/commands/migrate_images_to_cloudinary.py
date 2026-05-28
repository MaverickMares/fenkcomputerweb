import requests
from io import BytesIO
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from tienda.models import Marca, Producto, ImagenGaleria


def _download(url):
    r = requests.get(url, timeout=15)
    r.raise_for_status()
    return ContentFile(r.content, name=url.split("/")[-1])


def _migrate_field(instance, field_name, label):
    field = getattr(instance, field_name)
    if not field:
        return False
    url = field.url if not field.name.startswith("http") else field.name
    if "cloudinary.com" in url:
        print(f"  [skip] {label} ya en Cloudinary")
        return False
    if not url.startswith("http"):
        url = f"http://fenkcomputerweb-production.up.railway.app{url}"
    try:
        file = _download(url)
        getattr(instance, field_name).save(file.name, file, save=True)
        print(f"  [ok]   {label} → {getattr(instance, field_name).url}")
        return True
    except Exception as e:
        print(f"  [err]  {label}: {e}")
        return False


class Command(BaseCommand):
    help = "Sube las imágenes existentes del filesystem local a Cloudinary"

    def handle(self, *args, **options):
        ok = err = skip = 0

        print("=== Marcas ===")
        for m in Marca.objects.exclude(logo="").exclude(logo=None):
            result = _migrate_field(m, "logo", f"Marca {m.id} {m.nombre}")
            if result is True: ok += 1
            elif result is False and "skip" in str(result): skip += 1

        print("\n=== Productos ===")
        for p in Producto.objects.exclude(imagen="").exclude(imagen=None):
            result = _migrate_field(p, "imagen", f"Producto {p.id} {p.nombre[:40]}")
            if result: ok += 1

        print("\n=== Galería ===")
        for g in ImagenGaleria.objects.all():
            result = _migrate_field(g, "imagen", f"Galería {g.id} (producto {g.producto_id})")
            if result: ok += 1

        print(f"\nListo: {ok} migradas, {skip} ya en Cloudinary, {err} errores")
