# Variables de entorno — CONIITI

Guía para configurar el proyecto sin commitear secretos. Los archivos `.env` están en `.gitignore`; usa siempre los `.env.example` como plantilla.

## Reglas generales

1. **Nunca** subas `.env` al repositorio (ni `api-gateway/.env`, ni `front-end/.env`).
2. Copia la plantilla: `cp .env.example .env` (en la carpeta correspondiente).
3. En **Docker Compose**, el archivo `.env` en la **raíz del monorepo** alimenta `${JWT_SECRET_KEY}` y `${RABBITMQ_URL}` de varios servicios.
4. El **mismo `JWT_SECRET_KEY`** debe usarse en todos los servicios que emiten o validan tokens: `users-service`, `conferences-service` y `back-end` legacy.
5. Variables del frontend deben empezar por `VITE_` para que Vite las exponga al navegador.

---

## Mapa por componente

| Componente | Archivo plantilla | ¿Obligatorio? |
|------------|-------------------|---------------|
| Compose (raíz) | [`.env.example`](../.env.example) | Sí, para `docker compose` |
| Frontend | [`front-end/.env.example`](../front-end/.env.example) | Sí en desarrollo local |
| Users | [`users-service/.env.example`](../users-service/.env.example) | Si corres el servicio fuera de Compose |
| Conferences | [`conferences-service/.env.example`](../conferences-service/.env.example) | Idem |
| Notificaciones | [`notification-service/.env.example`](../notification-service/.env.example) | Idem |
| Backend legacy | [`back-end/.env.example`](../back-end/.env.example) | Solo monolito |
| API Gateway (Python) | [`api-gateway/.env.example`](../api-gateway/.env.example) | Solo si usas el gateway FastAPI (no el Nginx de Compose) |

---

## Raíz del monorepo (Docker Compose)

```bash
cp .env.example .env
```

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `JWT_SECRET_KEY` | Firma de tokens JWT (≥ 32 caracteres) | `python -c "import secrets; print(secrets.token_hex(64))"` |
| `RABBITMQ_USER` | Usuario del broker | `coniiti_mq` |
| `RABBITMQ_PASSWORD` | Contraseña del broker | valor seguro |
| `RABBITMQ_URL` | URL AMQP completa | `amqp://user:pass@rabbitmq:5672/` |

Compose inyecta `JWT_SECRET_KEY` y `RABBITMQ_URL` en `users-service` y `conferences-service` (ver `docker-compose.yml`).

---

## Frontend (`front-end/.env`)

```bash
cd front-end
cp .env.example .env
```

| Variable | Descripción | Desarrollo (Compose) | Producción |
|----------|-------------|----------------------|------------|
| `VITE_API_URL` | Base de la API | `/api` | `/api` o URL del gateway |
| `API_PROXY_TARGET` | Destino del proxy Vite (`/api` → gateway) | `http://127.0.0.1:8080` (host) o `http://gateway:80` (contenedor) | No aplica en build estático |
| `VITE_DEV_OTP_MAILBOX` | Muestra OTP en pantalla (solo dev) | `true` | `false` |
| `VITE_ENVIRONMENT` | Etiqueta de entorno | `development` | `production` |
| `VITE_API_TIMEOUT` | Timeout HTTP (ms) | `30000` | `30000` |

**Importante:** con `VITE_API_URL=/api`, el navegador llama al mismo origen (`:5173`) y Vite reenvía al gateway; no hace falta CORS hacia `:8080`.

---

## users-service

| Variable | Alias | Descripción | Default en Compose |
|----------|-------|-------------|-------------------|
| `MONGODB_URI` | `MONGODB_URL` | MongoDB | `mongodb://users-mongo:27017` |
| `MONGODB_DB` | — | Base de datos | `users_db` |
| `JWT_SECRET_KEY` | `JWT_SECRET` | Secreto JWT | desde `.env` raíz |
| `JWT_ALGORITHM` | — | Algoritmo | `HS256` |
| `JWT_ACCESS_TOKEN_EXPIRES_MINUTES` | — | Expiración token | `60` |
| `OTP_LENGTH` | — | Dígitos del OTP | `6` |
| `OTP_EXPIRE_MINUTES` | — | Validez OTP | `10` |
| `RABBITMQ_URL` | — | Broker | desde `.env` raíz |
| `EVENTS_EXCHANGE` | — | Exchange topic | `coniiti.events` |
| `LOG_LEVEL` | — | Logs JSON | `INFO` |

---

## conferences-service

| Variable | Alias | Descripción |
|----------|-------|-------------|
| `MONGODB_URI` | `MONGODB_URL` | MongoDB (`conferences-mongo` en Compose) |
| `MONGODB_DB` | — | `conferences_db` |
| `JWT_SECRET_KEY` | `JWT_SECRET` | Mismo secreto que users-service |
| `RABBITMQ_URL` | — | Publicación de `conference.created` |
| `EVENTS_EXCHANGE` | — | `coniiti.events` |
| `LOG_LEVEL` | — | `INFO` |

---

## notification-service

| Variable | Descripción | Valores |
|----------|-------------|---------|
| `NOTIFICATION_MODE` | Modo de envío | `simulado` (dev) o `smtp` |
| `DEV_MAILBOX_ENABLED` | API `/dev/mailbox/*` | `true` en simulado; `false` en prod |
| `NOTIFICATION_PORT` | Puerto HTTP | `8002` |
| `SMTP_SERVER` | Host SMTP | `mailpit` (local) o `smtp.gmail.com` |
| `SMTP_PORT` | Puerto | `1025` (Mailpit) o `587` (Gmail) |
| `SMTP_USERNAME` / `SMTP_PASSWORD` | Credenciales | Vacío en Mailpit; App Password en Gmail |
| `SMTP_FROM_EMAIL` / `SMTP_FROM_NAME` | Remitente | tu correo / `CONIITI Conference` |
| `SMTP_USE_TLS` | TLS explícito | `true` / `false` (auto: 587 sí, 1025 no) |
| `RABBITMQ_URL` | Consumer de eventos | `amqp://...@rabbitmq:5672/` |
| `EVENTS_EXCHANGE` | Exchange | `coniiti.events` |
| `EVENTS_QUEUE` | Cola | `notifications.q` |
| `SQLITE_PATH` | DB de eventos procesados | `/data/notifications.sqlite` |
| `LOG_LEVEL` | Logs JSON | `info` |

### OTP en desarrollo

| Modo | Variables | Dónde ver el código |
|------|-----------|---------------------|
| Bandeja dev | `NOTIFICATION_MODE=simulado`, `VITE_DEV_OTP_MAILBOX=true` | Banner en `/auth`, `/dev/mailbox` |
| Mailpit | `NOTIFICATION_MODE=smtp`, `SMTP_SERVER=mailpit`, `SMTP_PORT=1025` | http://localhost:8025 |

---

## back-end (legacy)

Solo necesario para rutas aún no migradas al gateway (`/api/*` fallback). Ver [`back-end/.env.example`](../back-end/.env.example).

---

## api-gateway (FastAPI, opcional)

El despliegue habitual usa **Nginx** (`nginx.conf` + servicio `gateway` en Compose), no el contenedor Python `api-gateway/`. Si usas el gateway FastAPI:

| Variable | Descripción |
|----------|-------------|
| `JWT_SECRET` | Debe coincidir con `JWT_SECRET_KEY` de los servicios |
| `BACKEND_URL` | URL del backend destino |
| `RATE_LIMIT_PER_MINUTE` | Límite de peticiones |

---

## Checklist rápido

- [ ] `.env` raíz con `JWT_SECRET_KEY` largo y `RABBITMQ_URL` correcto
- [ ] `front-end/.env` con `VITE_API_URL=/api` y proxy hacia `:8080`
- [ ] Sin archivos `.env` en commits (`git status` limpio)
- [ ] Producción: `VITE_DEV_OTP_MAILBOX=false`, `DEV_MAILBOX_ENABLED=false`, `NOTIFICATION_MODE=smtp`

---

Ver también: [ARQUITECTURA.md](./ARQUITECTURA.md) · [INTEGRATION_GUIDE.md](../INTEGRATION_GUIDE.md)
