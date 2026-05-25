#!/bin/bash
set -e

python manage.py makemigrations --no-input
python manage.py migrate --no-input
python manage.py loaddata tienda/fixtures/datos_iniciales.json || true
python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@fenkcomputers.com', 'hazel18')
    print('Superusuario creado')
else:
    user = User.objects.get(username='admin')
    user.set_password('hazel18')
    user.save()
    print('Contraseña actualizada')
"
exec gunicorn config.wsgi:application --bind "0.0.0.0:${PORT:-8000}" --workers 2 --timeout 120
