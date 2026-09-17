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
- Con Docker: Docker (y `docker compose` si más adelante se usa el compose del proyecto).

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

Cada proyecto tiene su propia imagen (ver Dockerfiles en `backend/` y `frontend/`),
publicadas en Docker Hub. Se ejecutan como dos contenedores independientes: el
frontend es un sitio estático (nginx) que llama a la API directamente desde el
navegador, así que no necesitan estar en la misma red Docker, solo tener sus
puertos publicados en el host.

**1. Backend:**

```bash
docker run -d \
  --name brev-backend \
  -p 8000:8000 \
  -v brev_db:/app/link-shortener.db \
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

> **Pendiente:** por ahora cada imagen se levanta con `docker run` por separado.
> Está previsto añadir un `docker-compose.yml` en la raíz para levantar todo el
> stack (backend + frontend) con un único comando — todavía no está hecho.

## Notas

- El backend no requiere variables de entorno propias; la URL del frontend
  (`VITE_API_URL`) es la única configuración cruzada entre ambos proyectos, y se
  fija en build time del frontend (ver su README).
- CORS en el backend está abierto a todos los orígenes (`allow_origins=["*"]`) — solo
  válido para desarrollo.
