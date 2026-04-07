# Sistema CONIITI — Producción y gestión

Monorepo para la plataforma de conferencias CONIITI: API REST (FastAPI + MongoDB), interfaz web (React + Vite + TypeScript) y servicios auxiliares (proxy Nginx, API Gateway opcional, microservicio de notificaciones).

## Descripción general

- Autenticación con registro, OTP (simulado o por email según configuración) y sesiones JWT.
- Roles: Super Admin, Web Master y Usuario registrado.
- Agenda de conferencias, conferencistas, calendario, inscripciones y asistencia (incluido flujo con QR en el portal de estudiantes).
- Contenido editable en sitio (p. ej. portada y galería) según las funciones implementadas en el front.

## Arquitectura del monorepo

| Componente | Rol |
|------------|-----|
| `back-end/` | API principal FastAPI, MongoDB (Motor), JWT, rutas de dominio. |
| `front-end/` | SPA React + Vite; cliente HTTP en `src/lib/api.ts`. |
| `nginx.conf` + servicio `gateway` en Compose | Reverse proxy: expone `/api/...` en el puerto 8080 y reenvía al backend. |
| `api-gateway/` | Gateway FastAPI opcional (puerto 8001): proxy bajo `/api`, validación JWT y límites de tasa; no es el camino por defecto del front en Compose (el front usa Nginx en 8080). |
| `notification-service/` | Microservicio de emails por plantillas (`POST /notify`); modo simulado o SMTP según variables. |
| `docker-compose.yml` | Orquesta front, Nginx, backend, MongoDB, api-gateway y notification-service. |

## Requisitos

**Desarrollo local**

- Python 3.11+ (recomendado; alineado con los Dockerfiles).
- Node.js 18+ y npm (o Bun).
- MongoDB accesible (por defecto `mongodb://localhost:27017`).

**Solo Docker Compose**

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (o Docker Engine + plugin Compose) en ejecución.

La configuración SMTP para Gmail u otro proveedor es **opcional** mientras el OTP o el correo estén en modo simulado o de desarrollo.

## Inicio rápido (desarrollo local)

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd produccion-proyect
```

### 2. Backend

```bash
cd back-end
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Editar .env si hace falta (MongoDB, JWT, SMTP)
python init_db.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend

```bash
cd ../front-end
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:8000
npm run dev
```

### 4. URLs habituales

- Interfaz web: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:8000](http://localhost:8000)
- Documentación interactiva: [http://localhost:8000/docs](http://localhost:8000/docs)

## Docker Compose

Desde la raíz del monorepo:

```bash
docker compose up --build
```

Población inicial de datos (cuando el contenedor `backend` esté en marcha):

```bash
docker compose exec backend python init_db.py
```

**URLs útiles**

| Servicio | URL |
|----------|-----|
| Frontend | [http://localhost:5173](http://localhost:5173) |
| API vía Nginx (prefijo `/api`) | [http://localhost:8080/api](http://localhost:8080/api) |
| API directa (Swagger) | [http://localhost:8000/docs](http://localhost:8000/docs) |
| API Gateway (opcional) | [http://localhost:8001](http://localhost:8001) |
| Notificaciones | [http://localhost:8002/health](http://localhost:8002/health) |

El front en Compose usa `VITE_API_URL=http://localhost:8080/api` para que las rutas (`/auth/...`, etc.) coincidan con el `location /api/` de Nginx. Vite incorpora las variables `VITE_*` al arrancar el servidor de desarrollo: si cambias el entorno, reconstruye o reinicia el servicio `frontend`.

## Variables de entorno (referencia)

**Backend** (`back-end/.env` — ver `back-end/.env.example`)

- `MONGODB_URI` / `MONGODB_URL` — conexión a MongoDB.
- `MONGODB_DB` — nombre de la base de datos.
- `JWT_SECRET_KEY` / `JWT_SECRET` — secreto compartido con el API Gateway si lo usas.

**Frontend** (`front-end/.env`)

- `VITE_API_URL` — base de la API: `http://localhost:8000` en local; `http://localhost:8080/api` con Docker Compose y Nginx.

**API Gateway** y **notification-service**: ejemplos en `api-gateway/.env.example` y `notification-service/.env.example`.

## Usuarios por defecto (`init_db.py`)

Tras ejecutar `python init_db.py` contra la misma base configurada en el backend:

| Email | Contraseña | Rol |
|-------|------------|-----|
| super_admin@example.com | SuperAdmin123! | Super Admin |
| web_master@example.com | WebMaster123! | Web Master |
| user@example.com | Usuario123! | Usuario registrado |

## CI y pruebas

- **GitHub Actions** (`.github/workflows/ci.yml`): ESLint, tests Vitest y build del front; comprobación ligera del backend (`compileall`).
- **Frontend:** `cd front-end && npm run test`
- En el backend no hay suite de pytest versionada; las pruebas automatizadas del API pueden añadirse en `back-end/` cuando se defina la estrategia.

## Estructura del proyecto

Árbol de **archivos y carpetas rastreados por Git** (no incluye `node_modules/`, `venv/`, `dist/`, artefactos de build ni `__pycache__/`). Para listar el estado actual en consola: `git ls-files`.

```
produccion-proyect/
├── .github
│   └── workflows
│       └── ci.yml
├── api-gateway
│   ├── app
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── client.py
│   │   ├── config.py
│   │   ├── main.py
│   │   ├── middleware.py
│   │   └── routes.py
│   ├── .env.example
│   ├── Dockerfile
│   └── requirements.txt
├── back-end
│   ├── app
│   │   ├── routes
│   │   │   ├── __init__.py
│   │   │   ├── agenda_inscriptions.py
│   │   │   ├── attendance.py
│   │   │   ├── auth.py
│   │   │   ├── calendar.py
│   │   │   ├── conferences.py
│   │   │   ├── sessions.py
│   │   │   ├── speakers.py
│   │   │   ├── stats.py
│   │   │   ├── student_agenda.py
│   │   │   └── users.py
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── config.py
│   │   ├── db.py
│   │   ├── email_service.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── mongo_utils.py
│   ├── .gitignore
│   ├── Dockerfile
│   ├── README.md
│   ├── init_db.py
│   ├── pyproject.toml
│   └── requirements.txt
├── front-end
│   ├── public
│   │   ├── favicon.ico
│   │   ├── placeholder.svg
│   │   └── robots.txt
│   ├── src
│   │   ├── assets
│   │   │   └── hero-agenda.jpg
│   │   ├── components
│   │   │   ├── layout
│   │   │   │   ├── AppNavbar.tsx
│   │   │   │   └── NavLink.tsx
│   │   │   ├── shared
│   │   │   │   ├── AgendaHero.tsx
│   │   │   │   ├── BotonRegistro.test.tsx
│   │   │   │   ├── BotonRegistro.tsx
│   │   │   │   ├── DayTabContent.tsx
│   │   │   │   ├── SessionCard.tsx
│   │   │   │   └── TechBackground.tsx
│   │   │   └── ui
│   │   │       ├── accordion.tsx
│   │   │       ├── alert-dialog.tsx
│   │   │       ├── alert.tsx
│   │   │       ├── aspect-ratio.tsx
│   │   │       ├── avatar.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── breadcrumb.tsx
│   │   │       ├── button.tsx
│   │   │       ├── calendar.tsx
│   │   │       ├── card.tsx
│   │   │       ├── carousel.tsx
│   │   │       ├── chart.tsx
│   │   │       ├── checkbox.tsx
│   │   │       ├── collapsible.tsx
│   │   │       ├── command.tsx
│   │   │       ├── context-menu.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── drawer.tsx
│   │   │       ├── dropdown-menu.tsx
│   │   │       ├── form.tsx
│   │   │       ├── hover-card.tsx
│   │   │       ├── input-otp.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       ├── menubar.tsx
│   │   │       ├── navigation-menu.tsx
│   │   │       ├── pagination.tsx
│   │   │       ├── popover.tsx
│   │   │       ├── progress.tsx
│   │   │       ├── radio-group.tsx
│   │   │       ├── resizable.tsx
│   │   │       ├── scroll-area.tsx
│   │   │       ├── select.tsx
│   │   │       ├── separator.tsx
│   │   │       ├── sheet.tsx
│   │   │       ├── sidebar.tsx
│   │   │       ├── skeleton.tsx
│   │   │       ├── slider.tsx
│   │   │       ├── sonner.tsx
│   │   │       ├── switch.tsx
│   │   │       ├── table.tsx
│   │   │       ├── tabs.tsx
│   │   │       ├── textarea.tsx
│   │   │       ├── toast.tsx
│   │   │       ├── toaster.tsx
│   │   │       ├── toggle-group.tsx
│   │   │       ├── toggle.tsx
│   │   │       ├── tooltip.tsx
│   │   │       ├── use-toast.ts
│   │   │       └── validated-input.tsx
│   │   ├── data
│   │   │   └── agendaData.ts
│   │   ├── features
│   │   │   ├── agenda
│   │   │   │   └── storage.ts
│   │   │   ├── auth
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   ├── RequireAuth.tsx
│   │   │   │   ├── storage.ts
│   │   │   │   ├── types.ts
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useRBAC.ts
│   │   │   ├── calendar
│   │   │   │   ├── storage.ts
│   │   │   │   └── types.ts
│   │   │   ├── conference
│   │   │   │   ├── storage.ts
│   │   │   │   └── types.ts
│   │   │   ├── content
│   │   │   │   ├── EditModals.tsx
│   │   │   │   └── storage.ts
│   │   │   ├── device
│   │   │   │   └── device.ts
│   │   │   ├── otp
│   │   │   │   ├── otp.ts
│   │   │   │   ├── storage.ts
│   │   │   │   └── types.ts
│   │   │   └── student-qr
│   │   │       └── studentQr.ts
│   │   ├── hooks
│   │   │   ├── use-countdown.ts
│   │   │   ├── use-mobile.tsx
│   │   │   ├── use-toast.ts
│   │   │   └── useFormValidation.ts
│   │   ├── lib
│   │   │   ├── api.ts
│   │   │   └── utils.ts
│   │   ├── pages
│   │   │   ├── Agenda.tsx
│   │   │   ├── AppGate.tsx
│   │   │   ├── Auth.tsx
│   │   │   ├── CalendarPage.tsx
│   │   │   ├── Conferencistas.tsx
│   │   │   ├── Index.tsx
│   │   │   ├── NotFound.tsx
│   │   │   ├── StudentPortal.tsx
│   │   │   ├── SuperAdminDashboard.tsx
│   │   │   └── WebMasterDashboard.tsx
│   │   ├── test
│   │   │   ├── example.test.ts
│   │   │   └── setup.ts
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   ├── README.md
│   ├── bun.lockb
│   ├── components.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── vitest.config.ts
├── notification-service
│   ├── app
│   │   ├── templates
│   │   │   ├── otp.html
│   │   │   ├── session_reminder.html
│   │   │   └── welcome.html
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── email.py
│   │   ├── main.py
│   │   └── models.py
│   ├── .env.example
│   ├── Dockerfile
│   └── requirements.txt
├── .gitignore
├── INTEGRATION_GUIDE.md
├── README.md
├── docker-compose.yml
└── nginx.conf
```

## Documentación adicional

- [Backend — detalle de API y modelos](./back-end/README.md)
- [Frontend](./front-end/README.md)
- [Guía de integración](./INTEGRATION_GUIDE.md) (si aplica a tu flujo de despliegue)

## Contribución

1. Fork del repositorio.
2. Rama de trabajo: `git checkout -b feature/nombre-descriptivo`.
3. Commits con mensajes claros.
4. Push y apertura de un Pull Request hacia la rama acordada por el equipo.

## Licencia

Este proyecto se distribuye bajo la licencia MIT.

---

Desarrollado en el marco del proyecto CONIITI.
