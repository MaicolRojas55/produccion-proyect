# Guía de integración Frontend ↔ Backend (microservicios)

Conecta el frontend React con la API expuesta por el **gateway Nginx** (`/api`). Para arquitectura y variables de entorno ver [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) y [docs/VARIABLES_ENTORNO.md](docs/VARIABLES_ENTORNO.md).

## Pre-requisitos

1. Docker Compose en ejecución **o** microservicios + gateway levantados manualmente.
2. Archivo `.env` en la raíz del monorepo (`cp .env.example .env`).
3. `front-end/.env` con `VITE_API_URL=/api`.

```bash
# Stack completo
docker compose up --build

# Frontend en el host (proxy al gateway)
cd front-end && npm install && cp .env.example .env
# Añadir en .env: API_PROXY_TARGET=http://127.0.0.1:8080
npm run dev
```

## Verificar conexión

```bash
curl http://localhost:8080/api/health/users
curl http://localhost:8080/api/health/conferences
```

En el navegador (consola, con la app en `:5173`):

```javascript
fetch('/api/health/users').then((r) => r.json()).then(console.log)
```

## Configuración mínima

### Raíz (Compose)

```env
JWT_SECRET_KEY=<mínimo 32 caracteres>
RABBITMQ_URL=amqp://usuario:password@rabbitmq:5672/
```

### Frontend (`front-end/.env`)

```env
VITE_API_URL=/api
API_PROXY_TARGET=http://127.0.0.1:8080
VITE_DEV_OTP_MAILBOX=true
VITE_ENVIRONMENT=development
```

> Dentro del contenedor `frontend`, Compose ya define `API_PROXY_TARGET=http://gateway:80`.

## Probar auth con curl (vía gateway)

### 1. Registro

```bash
curl -X POST "http://localhost:8080/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"full_name\":\"Juan Test\",\"email\":\"juan@test.com\",\"password\":\"Test12345!\",\"role\":\"usuario_registrado\"}"
```

El OTP **no** viene en la respuesta JSON. En desarrollo:

- Banner en http://localhost:5173/auth (`VITE_DEV_OTP_MAILBOX=true`), o
- `curl "http://localhost:8080/api/notifications/dev/mailbox/latest?email=juan@test.com"`, o
- Mailpit http://localhost:8025 si usas SMTP local.

### 2. Verificar OTP

```bash
curl -X POST "http://localhost:8080/api/auth/verify-otp?email=juan@test.com&code=123456"
```

### 3. Login

```bash
curl -X POST "http://localhost:8080/api/auth/token" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"juan@test.com\",\"password\":\"Test12345!\"}"
```

### 4. Perfil autenticado

```bash
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

## Flujos en el frontend

### Registro + sesión automática

```
Auth.tsx → register() → POST /api/auth/register
         → usuario ingresa OTP
         → activateAccount() → verify-otp + login + /auth/me
         → redirige a /student (sin volver a pantalla de login)
```

### Login existente

```
Auth.tsx → login() → POST /api/auth/token → GET /api/auth/me
         → redirige según rol (/dashboard o /student)
```

### Agenda estudiante

```
StudentPortal → apiClient.getConferences()
              → apiClient.addToStudentAgenda(id)  → /api/student-agenda/...
```

Cliente HTTP centralizado: `front-end/src/lib/api.ts`.

## Swagger / OpenAPI

Cada microservicio expone `/docs` **solo dentro de la red Docker** (puertos no publicados al host en Compose por defecto). Para depurar:

```bash
docker compose exec users-service curl -s http://127.0.0.1:8000/docs
```

La integración del front usa las rutas documentadas en el README y en `api.ts`, siempre con prefijo `/api` en el gateway.

## Troubleshooting

| Síntoma | Causa habitual | Solución |
|---------|----------------|----------|
| `ECONNREFUSED` en `/api` | Gateway o Compose parado | `docker compose up` |
| 401 en rutas protegidas | Sin token o JWT distinto entre servicios | Mismo `JWT_SECRET_KEY` en todos los servicios |
| CORS | Llamar a `:8080` desde `:5173` sin proxy | Usar `VITE_API_URL=/api` + proxy Vite |
| OTP no visible | Modo prod o mailbox desactivado | `VITE_DEV_OTP_MAILBOX=true`, `NOTIFICATION_MODE=simulado` |
| 404 en `/api/auth/...` | URL sin prefijo `/api` | `VITE_API_URL=/api` |
| Registro OK pero sin email | notification-service caído | `docker compose logs notification-service` |

## Usuarios de prueba (staff y estudiante)

Tras `docker compose up`, puedes iniciar sesión en http://localhost:5173/auth sin registrarte:

| Email | Contraseña | Rol |
|-------|------------|-----|
| `super_admin@example.com` | `SuperAdmin123!` | Super Admin |
| `web_master@example.com` | `WebMaster123!` | Web Master |
| `user@example.com` | `Usuario123!` | Usuario registrado |

## Checklist

- [ ] `.env` raíz con `JWT_SECRET_KEY` seguro
- [ ] `docker compose up` sin errores
- [ ] `curl` a `/api/health/users` responde 200
- [ ] Front en `:5173` con `VITE_API_URL=/api`
- [ ] Registro + OTP + entrada automática al portal
- [ ] Panel `/system-health` muestra servicios en verde

## Más documentación

- [README.md](README.md) — inicio rápido
- [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md)
- [docs/VARIABLES_ENTORNO.md](docs/VARIABLES_ENTORNO.md)
- [front-end/README.md](front-end/README.md)
