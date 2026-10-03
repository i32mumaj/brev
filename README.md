# brev — acortador de URLs con estadísticas de clics

Acortador de URLs que además lleva la cuenta de los clics de cada enlace.

```
brev/
├── backend/     FastAPI + SQLAlchemy + SQLite — API y redirecciones
└── frontend/    React + Vite + TypeScript — interfaz web
```

## Backend

Requiere [uv](https://docs.astral.sh/uv/) (se encarga de instalar Python 3.14 y las dependencias).

```bash
cd backend
uv run fastapi dev                # http://localhost:8000, docs en /docs
uv run python -m brev.seed        # opcional: BORRA todo y crea 30 enlaces de prueba
```

La base de datos SQLite (`link-shortener.db`) se crea sola en `backend/data/`. Se puede
cambiar la carpeta con la variable de entorno `DB_DIR`.

### Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/links` | Crea un enlace corto. Body `{"url": "..."}` → `{"short_url": "..."}` |
| `GET` | `/api/links` | Lista todos los enlaces |
| `GET` | `/api/links/{short_code}` | Datos de un enlace |
| `GET` | `/api/links/{short_code}/stats` | URL original, código, fecha de creación y número de clics |
| `DELETE` | `/api/links/{short_code}` | Borra un enlace y sus clics |
| `GET` | `/{short_code}` | Redirige a la URL original y registra el clic |

### Estructura

```
backend/src/brev/
├── main.py                 rutas
├── seed.py                 datos de prueba
├── database/               conexión (database.py) y modelos Link / Click (models.py)
├── schemas/schemas.py      esquemas Pydantic de entrada y salida
└── services/
    ├── link_services.py    lógica de enlaces
    ├── click_services.py   lógica de clics
    └── utils.py            generación del código corto
```

El código corto son 7 caracteres en base62 sacados del SHA-256 de la URL. Si
choca con uno existente, se vuelve a hashear encadenando el código anterior.

## Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev                       # http://localhost:5173
```

Más detalle en [`frontend/README.md`](frontend/README.md).
