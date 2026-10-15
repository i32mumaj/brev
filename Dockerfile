FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build


FROM python:3.14-slim
COPY --from=ghcr.io/astral-sh/uv:0.12 /uv /usr/local/bin/uv
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never

WORKDIR /app/backend
# Dependencies first, so code changes don't invalidate this layer.
COPY backend/pyproject.toml backend/uv.lock backend/.python-version ./
RUN uv sync --locked --no-dev --no-install-project
COPY backend/ ./
RUN uv sync --locked --no-dev

COPY --from=frontend /app/frontend/dist /app/static
COPY docker-entrypoint.sh /usr/local/bin/

RUN useradd --system --uid 1000 brev && mkdir /app/data && chown brev /app/data
USER brev

ENV PATH="/app/backend/.venv/bin:$PATH" \
    DB_DIR=/app/data \
    STATIC_DIR=/app/static \
    ENABLE_DOCS=false

EXPOSE 8000
ENTRYPOINT ["docker-entrypoint.sh"]
