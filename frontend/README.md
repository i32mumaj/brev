# brev · frontend

Frontend del acortador de URLs con estadísticas de clics. React + TypeScript + Vite.

## Requisitos

- Node.js 20+
- El backend (FastAPI) corriendo en `http://localhost:8000` — ver `../backend`.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL si el backend no está en localhost:8000
npm run dev
```

La app queda en `http://localhost:5173`.

## Scripts

- `npm run dev` — servidor de desarrollo con recarga en caliente.
- `npm run build` — comprueba tipos y genera el build de producción en `dist/`.
- `npm run preview` — sirve el build de producción localmente.
- `npm run lint` — linting con oxlint.

## Estructura

```
src/
├── components/   componentes de UI reutilizables
├── pages/        vistas (listado, detalle)
├── hooks/        estado y datos (tema, enlaces del usuario)
├── services/     cliente de la API
├── types/        tipos compartidos
└── lib/          utilidades (validación, formato, almacenamiento local)
```

## Notas

- "Tus enlaces" se guarda en el `localStorage` del navegador (30 días); el backend
  no tiene listado global ni usuarios.
- La vista de detalle usa un meter en vez de una serie temporal, ya que el backend
  sólo expone el total de clics por enlace.
