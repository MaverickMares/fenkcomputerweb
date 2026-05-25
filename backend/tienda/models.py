from django.db import models


class Categoria(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    icono = models.CharField(max_length=50, blank=True)

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class Marca(models.Model):
    nombre = models.CharField(max_length=100)
    logo = models.ImageField(upload_to="marcas/", blank=True, null=True)

    class Meta:
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    precio_usd = models.DecimalField(max_digits=10, decimal_places=2)
    precio_soles = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    imagen = models.ImageField(upload_to="productos/", blank=True, null=True)
    categoria = models.ForeignKey(
        Categoria, on_delete=models.SET_NULL, null=True, blank=True, related_name="productos"
    )
    marca = models.ForeignKey(
        Marca, on_delete=models.SET_NULL, null=True, blank=True, related_name="productos"
    )
    es_nuevo = models.BooleanField(default=False)
    es_oferta = models.BooleanField(default=False)
    consultar_disponibilidad = models.BooleanField(default=False)
    especificaciones = models.JSONField(default=dict, blank=True)
    creado = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        ordering = ["-es_nuevo", "nombre"]

    def __str__(self):
        return self.nombre


class ImagenGaleria(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="galeria")
    imagen = models.ImageField(upload_to="productos/galeria/")
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["orden"]

    def __str__(self):
        return f"Imagen de {self.producto.nombre} #{self.orden}"


class Configuracion(models.Model):
    nombre_tienda = models.CharField(max_length=200)
    whatsapp = models.CharField(max_length=20)
    direccion = models.TextField(blank=True)
    instagram = models.CharField(max_length=100, blank=True)
    facebook = models.CharField(max_length=100, blank=True)
    tiktok = models.CharField(max_length=100, blank=True)
    youtube = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = "Configuración"
        verbose_name_plural = "Configuración"

    def __str__(self):
        return self.nombre_tienda

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)


class ComponentePC(models.Model):
    TIPO_CHOICES = [
        # Componentes obligatorios
        ("CPU", "Procesador"),
        ("PLACA", "Placa Madre"),
        ("RAM", "Memoria RAM"),
        ("ALMACENAMIENTO", "Almacenamiento"),
        ("GPU", "Tarjeta de Video"),
        ("FUENTE", "Fuente de Poder"),
        ("CASE", "Gabinete"),
        # Periféricos opcionales
        ("MONITOR", "Monitor"),
        ("TECLADO", "Teclado"),
        ("MOUSE", "Mouse"),
        ("AURICULARES", "Auriculares"),
        ("MOUSEPAD", "Mousepad"),
        ("UPS", "Estabilizador UPS"),
        ("MICROFONO", "Micrófono"),
        ("CAMARA", "Cámara Web"),
    ]
    producto = models.OneToOneField(Producto, on_delete=models.CASCADE, related_name="componente")
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    socket_compatible = models.CharField(max_length=50, blank=True)
    tipo_ram_compatible = models.CharField(max_length=50, blank=True)
    # GPU: watts mínimos requeridos. FUENTE: watts que entrega.
    watts_recomendados = models.PositiveIntegerField(default=0)
    # PLACA: form factor propio (ATX/mATX/ITX). CASE: form factor máximo soportado.
    form_factor = models.CharField(max_length=20, blank=True)

    class Meta:
        verbose_name = "Componente PC"
        verbose_name_plural = "Componentes PC"

    def __str__(self):
        return f"{self.get_tipo_display()} — {self.producto.nombre}"
