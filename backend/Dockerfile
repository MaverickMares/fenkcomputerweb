FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

RUN chmod +x entrypoint.sh

ENV SECRET_KEY=django-build-dummy-key \
    DEBUG=False \
    ALLOWED_HOSTS=localhost,127.0.0.1

RUN python manage.py collectstatic --no-input

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
