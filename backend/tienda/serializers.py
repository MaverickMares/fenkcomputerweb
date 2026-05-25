from rest_framework import serializers
from .models import Categoria, Marca, Producto, ImagenGaleria, Configuracion, ComponentePC


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ["id", "nombre", "descripcion", "icono"]


class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = ["id", "nombre", "logo"]


class ImagenGaleriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagenGaleria
        fields = ["id", "imagen", "orden"]


class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source="categoria.nombre", read_only=True)
    marca_nombre = serializers.CharField(source="marca.nombre", read_only=True)

    class Meta:
        model = Producto
        fields = [
            "id", "nombre", "descripcion", "precio_usd", "precio_soles",
            "stock", "imagen", "categoria", "categoria_nombre",
            "marca", "marca_nombre", "es_nuevo", "es_oferta",
            "consultar_disponibilidad", "creado",
        ]


class ProductoDetalleSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source="categoria.nombre", read_only=True)
    marca_nombre = serializers.CharField(source="marca.nombre", read_only=True)
    galeria = ImagenGaleriaSerializer(many=True, read_only=True)

    class Meta:
        model = Producto
        fields = [
            "id", "nombre", "descripcion", "precio_usd", "precio_soles",
            "stock", "imagen", "galeria", "categoria", "categoria_nombre",
            "marca", "marca_nombre", "es_nuevo", "es_oferta",
            "consultar_disponibilidad", "especificaciones", "creado",
        ]


class ConfiguracionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Configuracion
        fields = [
            "id", "nombre_tienda", "whatsapp", "direccion",
            "instagram", "facebook", "tiktok", "youtube",
        ]


class ComponentePCSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer(read_only=True)

    class Meta:
        model = ComponentePC
        fields = ["id", "tipo", "socket_compatible", "tipo_ram_compatible", "watts_recomendados", "form_factor", "producto"]
