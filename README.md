# brev — acortador de URLs con estadísticas de clics

Monorepo con el backend y el frontend de **brev**, un acortador de URLs que además
lleva la cuenta de los clics de cada enlace.

```
brev/
├── backend/     FastAPI + SQLAlchemy + SQLite — API y redirecciones
└── frontend/    React + Vite + TypeScript — interfaz web
```

Cada proyecto tiene su propio README con detalle (estructura, endpoints, scripts, etc.):

- [`backend/README.md`](backend/README.md)
- [`frontend/README.md`](frontend/README.md)

Este README explica cómo levantar **los dos juntos**, con y sin Docker.

## Requisitos

- Sin Docker: Python 3.12+ y Node.js 20+.
- Con Docker: Docker con Docker Compose (`docker compose`).

## Puesta en marcha sin Docker

En dos terminales, una por proyecto.

**1. Backend** (arranca primero, el frontend depende de él):

```bash
cd backend
python -m venv venv
source venv/bin/activate       # en Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Queda escuchando en `http://localhost:8000`. Opcionalmente, `python3 seed.py` para tener
datos de prueba.

**2. Frontend:**

```bash
cd frontend
npm install
cp .env.example .env   # por defecto ya apunta a http://localhost:8000
npm run dev
```

Queda escuchando en `http://localhost:5173`. Abre esa URL en el navegador.

## Puesta en marcha con Docker

### Opción recomendada: Docker Compose

Levanta backend y frontend juntos con un solo comando, usando las imágenes
publicadas en Docker Hub (`i32mumaj/brev-backend`, `i32mumaj/brev-frontend`):

```bash
docker compose up -d
```

- Backend en `http://localhost:8000`, frontend en `http://localhost:5173`.
- La base de datos SQLite se persiste en el volumen con nombre `brev_db`
  (montado en `/app/data` dentro del contenedor del backend), así que sobrevive
  a `docker compose down` (usa `docker compose down -v` si quieres borrarla).
- El backend arranca con `FRONTEND_ORIGIN=http://localhost:5173`, así que solo
  acepta peticiones CORS del frontend (ver "Notas" más abajo).
- Para pararlo: `docker compose down`.

### Alternativa: contenedores sueltos con las imágenes de Docker Hub

Cada proyecto también tiene su imagen publicada en Docker Hub. Al no usar
Compose, ambos contenedores se levantan por separado; el frontend es un sitio
estático (nginx) que llama a la API directamente desde el navegador, así que
no necesitan compartir red Docker, solo tener sus puertos publicados en el host.

**1. Backend:**

```bash
docker run -d \
  --name brev-backend \
  -p 8000:8000 \
  -e FRONTEND_ORIGIN=http://localhost:5173 \
  -e DB_DIR=/app/data \
  -v brev_db:/app/data \
  i32mumaj/brev-backend:latest
```

**2. Frontend:**

```bash
docker run -d \
  --name brev-frontend \
  -p 5173:80 \
  i32mumaj/brev-frontend:latest
```

Con ambos contenedores arriba, abre `http://localhost:5173`. La imagen del frontend
publicada en Docker Hub está construida apuntando a `http://localhost:8000`.

## Notas

- El backend restringe CORS al origen exacto del frontend vía la variable de
  entorno `FRONTEND_ORIGIN` (por defecto `http://localhost:5173`); peticiones
  desde cualquier otro origen se bloquean.
- La ruta de la base de datos SQLite es configurable con `DB_DIR` (por defecto
  el propio directorio de `backend/`); en Docker se fija a `/app/data` para que
  pueda montarse ahí un volumen con nombre.
- La URL del backend en el frontend (`VITE_API_URL`) se fija en build time del
  frontend, no en runtime (ver su README).
