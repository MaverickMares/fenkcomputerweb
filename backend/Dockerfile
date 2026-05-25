FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

ENV SECRET_KEY=django-build-dummy-key \
    DEBUG=False

RUN python manage.py collectstatic --no-input

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
