#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

python manage.py makemigrations --no-input
python manage.py collectstatic --no-input
python manage.py migrate

python manage.py shell -c "
from tienda.models import Categoria
if not Categoria.objects.exists():
    from django.core.management import call_command
    call_command('loaddata', 'datos_iniciales.json')
    print('Datos iniciales cargados')
else:
    print('Base de datos ya tiene datos, omitiendo fixtures')
"
