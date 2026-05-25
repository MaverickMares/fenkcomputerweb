# 🎂 Melani's Sweet Creations — Web

Sitio web completo para pastelería artesanal con panel de administración.

**Stack:** Django + DRF (backend) · React + Vite + TailwindCSS (frontend) · SQLite

---

## Estructura del proyecto

```
pasteleria-web/
├── backend/          # Django + REST API
│   ├── config/       # Configuración del proyecto Django
│   ├── tienda/       # App principal (modelos, vistas, API)
│   │   └── fixtures/ # Datos de ejemplo
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/         # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── hooks/
│   └── .env.example
└── README.md
```

---

## Instalación local

### Requisitos previos
- Python 3.10+
- Node.js 18+

### 1. Backend (Django)

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env si es necesario

# Migraciones y datos de ejemplo
python manage.py migrate
python manage.py loaddata tienda/fixtures/datos_iniciales.json

# Crear superusuario para el admin
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
```

El backend corre en: http://localhost:8000

### 2. Frontend (React)

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

El frontend corre en: http://localhost:5173

---

## Panel de administración

Accede a http://localhost:8000/admin con el superusuario creado.

Desde el admin puedes:
- Gestionar **Categorías** (nombre, descripción, imagen)
- Gestionar **Productos** (nombre, descripción, precio, imagen, categoría, disponible, destacado)
- Editar la **Configuración** de la pastelería (nombre, WhatsApp, Instagram, Facebook, dirección)

---

## API REST

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/categorias/` | Lista todas las categorías |
| `GET /api/productos/` | Lista productos disponibles |
| `GET /api/productos/?categoria=1` | Filtra por categoría |
| `GET /api/configuracion/` | Configuración general |

---

## Deploy en Railway

### Backend

1. Crear un nuevo servicio en Railway apuntando a `/backend`
2. Configurar variables de entorno:
   ```
   SECRET_KEY=<clave-secreta-larga>
   DEBUG=False
   ALLOWED_HOSTS=<tu-dominio>.railway.app
   CORS_ALLOWED_ORIGINS=https://<tu-frontend>.railway.app
   ```
3. Railway ejecuta `build.sh` automáticamente (migraciones + collectstatic)

### Frontend

1. Crear otro servicio apuntando a `/frontend`
2. Build command: `npm run build`
3. Configurar:
   ```
   VITE_API_URL=https://<tu-backend>.railway.app/api
   ```

---

## Deploy en Render

### Backend

1. Nuevo **Web Service** → conectar repo → Root Directory: `backend`
2. Build Command: `bash build.sh`
3. Start Command: `gunicorn config.wsgi:application`
4. Variables de entorno igual que Railway

### Frontend

1. Nuevo **Static Site** → Root Directory: `frontend`
2. Build Command: `npm run build`
3. Publish Directory: `dist`
4. Variable: `VITE_API_URL=https://<tu-backend>.onrender.com/api`

---

## Credenciales de prueba

```
Admin URL:  http://localhost:8000/admin
Usuario:    admin
Contraseña: admin123
```

> Cambiar la contraseña antes de llevar a producción.
