#!/usr/bin/env bash
set -o errexit

python manage.py migrate --no-input

python manage.py shell -c "
from tienda.models import Categoria
if not Categoria.objects.exists():
    from django.core.management import call_command
    call_command('loaddata', 'datos_iniciales.json')
    print('Datos iniciales cargados')
else:
    print('Base de datos ya tiene datos, omitiendo seed')
"

exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
