# Brev Backend

API backend para un acortador de URLs, construida con FastAPI y SQLAlchemy sobre SQLite.

## Requisitos

- Python 3.12+
- pip

## Puesta en marcha sin Docker

```bash
python -m venv venv
source venv/bin/activate       # en Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

El servidor se levanta por defecto en `http://127.0.0.1:8000`. La base de datos SQLite
(`link-shortener.db`) se crea automáticamente en este directorio al arrancar.

Por defecto solo acepta peticiones CORS desde `http://localhost:5173` (ver
"Variables de entorno" más abajo).

## Puesta en marcha con Docker

Se recomienda usar el `docker-compose.yml` de la raíz del repo, que ya deja
listos el volumen de la base de datos y las variables de entorno (ver el
[README raíz](../README.md)). Para levantar solo el backend con la imagen
publicada en Docker Hub:

```bash
docker run -d \
  --name brev-backend \
  -p 8000:8000 \
  -e FRONTEND_ORIGIN=http://localhost:5173 \
  -e DB_DIR=/app/data \
  -v brev_db:/app/data \
  i32mumaj/brev-backend:latest
```

- `-v brev_db:/app/data` persiste la base de datos en un volumen con nombre, para
  que los datos sobrevivan si el contenedor se recrea. Importante: el volumen se
  monta sobre un **directorio** (`/app/data`, vía `DB_DIR`), no directamente sobre
  el fichero `.db` — si se monta sobre un fichero que todavía no existe, Docker
  crea ahí un directorio vacío y SQLite falla al abrirlo.
- El servidor queda accesible en `http://localhost:8000`.

## Variables de entorno

| Variable | Por defecto | Descripción |
|---|---|---|
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Único origen permitido en CORS. |
| `DB_DIR` | `.` (directorio de `backend/`) | Carpeta donde vive `link-shortener.db`. |

### (Opcional) Poblar la base de datos con datos de prueba

Sin Docker:

```bash
python3 seed.py
```

Con Docker, dentro del contenedor en marcha:

```bash
docker exec -it brev-backend python3 seed.py
```

Esto crea 30 enlaces de ejemplo con clics aleatorios distribuidos en los últimos 30 días.

## Modelo de datos

- **Link**: `id`, `short_code` (único), `original_url`, `created_at`
- **Click**: `id`, `link_id` (FK a `Link`), `clicked_at`

Cada `Link` tiene una relación uno-a-muchos con `Click`, usada para registrar y contar visitas.

El código corto se genera mediante `hash_7_chars` (`utils.py`), que aplica SHA-256 sobre la URL y codifica el resultado en base62, truncado a 7 caracteres. Si hay colisión, se reintenta concatenando el código previo a la URL.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/links` | Crea un enlace corto a partir de una URL. Devuelve `{ "short_url": "..." }` |
| `GET` | `/api/links` | Lista todos los enlaces |
| `GET` | `/api/links/{short_code}` | Devuelve los datos de un enlace |
| `GET` | `/api/links/{short_code}/stats` | Devuelve URL original, código, fecha de creación y número de clics |
| `DELETE` | `/api/links/{short_code}` | Elimina un enlace (y sus clics, por cascada) |
| `GET` | `/{short_code}` | Redirige a la URL original y registra el clic |

### Ejemplo

```bash
curl -X POST http://127.0.0.1:8000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com"}'
```

```json
{ "short_url": "http://127.0.0.1:8000/aB3xY9z" }
```

## Estructura del proyecto

```
main.py       # Rutas de la API
models.py     # Modelos SQLAlchemy (Link, Click)
schemas.py    # Esquemas Pydantic (validación de entrada)
database.py   # Configuración de la conexión y la sesión de SQLAlchemy
utils.py      # Generación del código corto
seed.py       # Script para poblar la base de datos con datos de prueba
```

## Notas

- CORS solo permite el origen configurado en `FRONTEND_ORIGIN` (ver "Variables de entorno").
- La base de datos es SQLite (`link-shortener.db`) y se crea automáticamente al iniciar la app.
