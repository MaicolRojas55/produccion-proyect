# Sistema CONIITI — Producción y gestión

Monorepo para la plataforma de conferencias CONIITI: frontend React, gateway Nginx, microservicios FastAPI y comunicación asíncrona por eventos con RabbitMQ.

## Descripción general

- Autenticación con registro, OTP (simulado o por email según configuración) y sesiones JWT.
- Roles: Super Admin, Web Master y Usuario registrado.
- Agenda de conferencias, conferencistas, calendario, inscripciones y asistencia (incluido flujo con QR en el portal de estudiantes).
- Contenido editable en sitio (p. ej. portada y galería) según las funciones implementadas en el front.

## Arquitectura del monorepo

Documentación detallada: [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) · Variables de entorno: [docs/VARIABLES_ENTORNO.md](docs/VARIABLES_ENTORNO.md)

| Componente | Rol |
|------------|-----|
| `front-end/` | SPA React + Vite; cliente HTTP en `src/lib/api.ts`. |
| `nginx.conf` + servicio `gateway` en Compose | Punto único de entrada (`http://localhost:8080/api`) y ruteo por dominio. |
| `users-service/` | Autenticación, usuarios, OTP. MongoDB propia; publica `user.registered` en RabbitMQ. |
| `conferences-service/` | Conferencias y agenda de estudiante. MongoDB propia; eventos `conference.created`. |
| `notification-service/` | Correos OTP y consumidor de eventos. SQLite + RabbitMQ. |
| `back-end/` | API legacy (fallback del gateway para rutas no migradas). |
| `docker-compose.yml` | Orquesta frontend, gateway, microservicios, RabbitMQ, Mailpit y bases por servicio. |

## Requisitos

**Desarrollo local**

- Python 3.11+ (recomendado; alineado con los Dockerfiles).
- Node.js 18+ y npm (o Bun).
- MongoDB accesible (por defecto `mongodb://localhost:27017`).

**Solo Docker Compose**

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (o Docker Engine + plugin Compose) en ejecución.

La configuración SMTP para Gmail u otro proveedor es **opcional** mientras el OTP o el correo estén en modo simulado o de desarrollo.

## Inicio rápido (recomendado: Docker Compose)

### 1. Clonar y configurar secretos

```bash
git clone <url-del-repositorio>
cd produccion-proyect
cp .env.example .env
# Editar .env: JWT_SECRET_KEY (≥32 caracteres) y RABBITMQ_URL
```

### 2. Levantar el stack

```bash
docker compose up --build
```

### 3. Frontend local (opcional, sin contenedor)

```bash
cd front-end
npm install
cp .env.example .env
# VITE_API_URL=/api y API_PROXY_TARGET=http://127.0.0.1:8080
npm run dev
```

### 4. URLs habituales

| Recurso | URL |
|---------|-----|
| Interfaz web | [http://localhost:5173](http://localhost:5173) |
| API (gateway) | [http://localhost:8080/api](http://localhost:8080/api) |
| Panel de uptime | [http://localhost:5173/system-health](http://localhost:5173/system-health) |
| Bandeja OTP (dev) | [http://localhost:5173/dev/mailbox](http://localhost:5173/dev/mailbox) |
| Mailpit (opcional) | [http://localhost:8025](http://localhost:8025) |

### Desarrollo solo monolito (legacy)

Si trabajas únicamente con `back-end/` sin microservicios, ver [back-end/README.md](back-end/README.md) y usa `VITE_API_URL=http://localhost:8000` en el frontend.

## Docker Compose (arquitectura requerida)

Requisito previo: archivo `.env` en la raíz (copiar desde `.env.example`).

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
| API vía Gateway | [http://localhost:8080/api](http://localhost:8080/api) |
| Health agregado | [http://localhost:8080/api/health/users](http://localhost:8080/api/health/users) (y `/conferences`, `/notifications`, `/backend`) |
| Mailpit | [http://localhost:8025](http://localhost:8025) |
| RabbitMQ UI | Solo si expones puerto `15672` en `docker-compose.yml` |

El front en Compose usa `VITE_API_URL=/api` y el **proxy de Vite** (`API_PROXY_TARGET=http://gateway:80`) para que el navegador solo hable con `:5173`; las peticiones a `/api/*` las reenvía el dev server al gateway.

### Ruteo en el gateway

- `/api/auth/*` y `/api/users/*` -> `users-service`
- `/api/conferences/*` y `/api/student-agenda/*` -> `conferences-service`
- `/api/notifications/*` -> `notification-service`
- `/api/*` restante -> `back-end` (fallback temporal para rutas no migradas)

### Mensajería asíncrona y resiliencia

- Broker: RabbitMQ (`coniiti.events`, exchange topic durable).
- Productores:
  - `users-service` publica `user.registered`.
  - `conferences-service` publica `conference.created`.
- Consumidor:
  - `notification-service` consume `user.*` y `conference.*` desde cola durable `notifications.q`.
  - Cada evento procesado se guarda en SQLite (`/data/notifications.sqlite`), base propia del servicio.

### OTP en desarrollo (bandeja simulada)

Con `NOTIFICATION_MODE=simulado` (valor por defecto en Compose), no se envían correos reales. El código OTP queda disponible sin revisar logs:

| Dónde | URL / variable |
|-------|----------------|
| Pantalla de registro | Tras crear la cuenta, banner amarillo con el código |
| Bandeja global | [http://localhost:5173/dev/mailbox](http://localhost:5173/dev/mailbox) |
| API | `GET /api/notifications/dev/mailbox/latest?email=...` |

Variables: `DEV_MAILBOX_ENABLED=true` (notification-service), `VITE_DEV_OTP_MAILBOX=true` (frontend). En producción usa `NOTIFICATION_MODE=smtp` con credenciales SMTP (Gmail App Password, Resend, etc.) y desactiva ambas variables.

### Mailpit (correo real en local, gratis)

[Mailpit](https://mailpit.axllent.org/) es **gratuito** (licencia MIT): un servidor SMTP de prueba con bandeja web. No envía correos a internet; los captura para que los veas en el navegador.

| | Bandeja dev (actual) | Mailpit |
|--|----------------------|---------|
| Costo | Gratis | Gratis |
| Dónde ver el OTP | Banner en `/auth` o `/dev/mailbox` | [http://localhost:8025](http://localhost:8025) |
| Flujo | Código en pantalla sin email | Email HTML como en producción |
| Config | `NOTIFICATION_MODE=simulado` | `NOTIFICATION_MODE=smtp` + host `mailpit:1025` |

Con Compose ya incluye el servicio `mailpit`. Para usarlo, en `notification-service` (o variables de `docker-compose`):

```env
NOTIFICATION_MODE=smtp
SMTP_SERVER=mailpit
SMTP_PORT=1025
DEV_MAILBOX_ENABLED=false
```

Abre [http://localhost:8025](http://localhost:8025), regístrate en la app y el OTP aparecerá como un correo entrante.

## Pruebas end-to-end y de resiliencia

### Flujo base

1. Levantar stack:

```bash
docker compose up --build
```

2. Verificar salud:

```bash
curl http://localhost:8080/api/health/users
curl http://localhost:8080/api/health/conferences
curl http://localhost:8080/api/notifications/health
curl http://localhost:8080/api/notifications/metrics
```

3. Registrar usuario (publica evento `user.registered`):

```bash
curl -X POST "http://localhost:8080/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"full_name\":\"Test User\",\"email\":\"testuser@example.com\",\"password\":\"Test12345!\",\"role\":\"usuario_registrado\"}"
```

4. Crear conferencia con token staff (publica `conference.created`).

### Prueba de resiliencia (video de 1 minuto)

1. Apagar notificaciones:

```bash
docker compose stop notification-service
```

2. Desde el front, crear una ponencia/conferencia (la app debe seguir funcionando).

3. Encender notificaciones:

```bash
docker compose start notification-service
```

4. Validar que consume pendientes:

```bash
curl http://localhost:8002/metrics
docker compose logs notification-service
```

Si `processed_events_total` crece y los logs muestran `evento_consumido`, la resiliencia asíncrona está comprobada.

## Variables de entorno

Guía completa (tablas por servicio, OTP, Mailpit, checklist): **[docs/VARIABLES_ENTORNO.md](docs/VARIABLES_ENTORNO.md)**

Resumen:

1. Raíz: `cp .env.example .env` → `JWT_SECRET_KEY`, `RABBITMQ_URL`.
2. Frontend: `cp front-end/.env.example front-end/.env` → `VITE_API_URL=/api`.
3. Cada microservicio tiene su `.env.example` si lo ejecutas fuera de Compose.
4. **Nunca** commitear archivos `.env` (están en `.gitignore`).

## Usuarios por defecto (`init_db.py`)

Tras ejecutar `python init_db.py` contra la misma base configurada en el backend:

| Email | Contraseña | Rol |
|-------|------------|-----|
| super_admin@example.com | SuperAdmin123! | Super Admin |
| web_master@example.com | WebMaster123! | Web Master |
| user@example.com | Usuario123! | Usuario registrado |

## CI y pruebas

- **GitHub Actions** (`.github/workflows/ci.yml`): ESLint, Vitest, **pytest** en `users-service`, `notification-service` y `conferences-service`, build del frontend.
- **CD:** `deploy-staging.yml` (rama `develop`) y `deploy-production.yml` (rama `main`) tras CI verde.
- **Local:**
  - Frontend: `cd front-end && npm run test`
  - Backend: `cd users-service && pip install -r requirements.txt -r requirements-dev.txt && python -m pytest`

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

| Documento | Contenido |
|-----------|-----------|
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Diagramas, microservicios, flujos OTP, enrutamiento |
| [docs/VARIABLES_ENTORNO.md](docs/VARIABLES_ENTORNO.md) | Cómo crear y usar `.env` por componente |
| [docs/ENTREGABLE_FINAL.md](docs/ENTREGABLE_FINAL.md) | Matriz del entregable, migración, sustentación |
| [docs/GITFLOW.md](docs/GITFLOW.md) | Ramas, PRs y despliegues |
| [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) | Integración frontend ↔ API (Compose) |
| [k8s/README.md](k8s/README.md) | Despliegue en Kubernetes |
| [back-end/README.md](back-end/README.md) | API monolito legacy |
| [front-end/README.md](front-end/README.md) | Detalle del cliente React |

## Contribución

Ver [docs/GITFLOW.md](docs/GITFLOW.md): ramas `feature/*` → PR a `develop` → PR a `main`.

## Licencia

Este proyecto se distribuye bajo la licencia MIT.

---

Desarrollado en el marco del proyecto CONIITI.
