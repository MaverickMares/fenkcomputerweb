#!/bin/bash
set -e

python manage.py migrate --no-input

# Carga el fixture solo si la base de datos está vacía (primera deploy)
PRODUCT_COUNT=$(python manage.py shell -c "from tienda.models import Producto; print(Producto.objects.count())" 2>/dev/null || echo "0")
if [ "$PRODUCT_COUNT" = "0" ]; then
    echo "Base de datos vacía — cargando fixture inicial..."
    python manage.py loaddata tienda/fixtures/datos_iniciales.json
    echo "Fixture cargado."
else
    echo "Base de datos ya contiene $PRODUCT_COUNT productos — omitiendo fixture."
fi

python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@fenk.pe', 'hazel18')
    print('Superusuario creado: admin / hazel18')
else:
    user = User.objects.get(username='admin')
    user.email = 'admin@fenk.pe'
    user.set_password('hazel18')
    user.save()
    print('Superusuario verificado: admin / hazel18')
"

exec gunicorn config.wsgi:application --bind "0.0.0.0:${PORT:-8000}" --workers 2 --timeout 120
