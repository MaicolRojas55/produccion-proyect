# Producción Proyect / CONIITI

Proyecto dividido en **frontend** (React + Vite) y **backend** (Python + FastAPI). El backend está pensado para uvicorn, gunicorn y despliegue en Azure.

## Estructura

```
produccion-proyect/
├── frontend/     # React, TypeScript, Vite, Tailwind, shadcn-ui
├── backend/      # Python, FastAPI, uvicorn, gunicorn
├── README.md
└── .gitignore
```

## Frontend

- **Tecnologías:** Vite, React, TypeScript, Tailwind CSS, shadcn-ui.
- **Importante:** el frontend debe ejecutarse desde la carpeta `frontend` (o con `npm run dev` desde la raíz). Si abres el `index.html` directamente (file://) o desde otra ruta, la pantalla puede quedar en blanco.

**Opción A — desde la raíz del repo:**

```bash
npm run dev
```

**Opción B — desde la carpeta frontend:**

```bash
cd frontend
npm install
npm run dev
```

Abre **http://localhost:8080** en el navegador (no uses file:// ni otro puerto).

- **Build:** `npm run build` (genera `frontend/dist`).

## Backend

- **Tecnologías:** Python, FastAPI, uvicorn, gunicorn.
- **Desarrollo:** servidor con recarga con uvicorn.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs

- **Producción (gunicorn + uvicorn):**

```bash
cd backend
gunicorn main:app -c gunicorn.conf.py
```

- **Azure:** configurar el comando de inicio del App Service para que ejecute gunicorn (desde la carpeta `backend` o con el módulo `backend.main:app`). Ver `backend/README.md`.

## Resumen de comandos

| Dónde   | Comando                          | Propósito        |
|--------|-----------------------------------|------------------|
| frontend | `npm run dev`                   | App React en dev |
| frontend | `npm run build`                 | Build estático   |
| backend  | `uvicorn main:app --reload ...` | API en dev       |
| backend  | `gunicorn main:app -c gunicorn.conf.py` | API en producción |
