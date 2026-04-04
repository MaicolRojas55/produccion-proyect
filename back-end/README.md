# Producción Conference API - Backend

API REST desarrollada con FastAPI para la plataforma de conferencias CONIITI. Sistema completo de autenticación, gestión de eventos, inscripciones y asistencia.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Modelos de Datos](#modelos-de-datos)
- [Autenticación](#autenticación)
- [Sistema OTP](#sistema-otp)
- [Desarrollo](#desarrollo)

## ✨ Características

- 🔐 **Autenticación JWT** con roles (super_admin, web_master, usuario_registrado)
- 📧 **Verificación OTP** simulada en terminal (migración a microservicio en progreso)
- 📅 **Gestión de Conferencias** - CRUD completo
- 👥 **Gestión de Conferencistas** - Información de speakers
- 🗓️ **Calendario de Eventos** - Eventos con control de audiencia
- 📋 **Agenda Personal** - Estudiantes pueden personalizar su agenda
- 📝 **Inscripciones a Sesiones** - Control de capacidad
- ✅ **Sistema de Asistencia** - Registro con QR
- 🗄️ **Base de Datos MongoDB** - Persistencia asincrónica
- 🔄 **CORS Habilitado** - Compatible con frontend en desarrollo

## 🔧 Requisitos

- Python 3.9+
- MongoDB 4.4+ (corriendo localmente en `mongodb://localhost:27017`)
- pip (gestor de paquetes Python)

## 📦 Instalación

### 1. Clonar el repositorio y navegar al backend

```bash
cd back-end
```

### 2. Crear entorno virtual

```bash
# En Windows
python -m venv venv
venv\Scripts\activate

# En macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar archivo .env

Crear archivo `.env` en el directorio `back-end/`:

```env
# Base de Datos
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=produccion_db

# JWT
JWT_SECRET_KEY=change-this-secret-value
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRES_MINUTES=60

# OTP
OTP_LENGTH=6
OTP_EXPIRE_MINUTES=10

# Email SMTP (TEMPORALMENTE NO UTILIZADOS - Para microservicio futuro)
# SMTP_SERVER=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USERNAME=
# SMTP_PASSWORD=
# SMTP_FROM_EMAIL=
# SMTP_FROM_NAME=CONIITI Conference
```

## 🚀 Uso

### Iniciar el servidor

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

El servidor estará disponible en: `http://localhost:8000`

- **Documentación Swagger**: `http://localhost:8000/docs`
- **Documentación ReDoc**: `http://localhost:8000/redoc`

### Ubicación de los logs de OTP

Cuando un usuario se registra o solicita verificación OTP, el código aparecerá en la terminal:

```
================================================================================
🔐 VERIFICACIÓN OTP - CONIITI CONFERENCE (TEMPORALMENTE SIMULADA)
================================================================================

Para: usuario@example.com
Hola Usuario!

Tu código de verificación es:

    ┌─────────────────────┐
    │  123456  │
    └─────────────────────┘

⏱️  Este código expira en 10 minutos.
⚠️  No compartas este código con nadie.

================================================================================
```

**Copia el código de 6 dígitos e úsalo en el frontend para completar la verificación.**

## 📡 API Endpoints

### Autenticación (`/auth`)

| Método | Endpoint           | Descripción             | Autenticación |
| ------ | ------------------ | ----------------------- | ------------- |
| POST   | `/auth/register`   | Registrar nuevo usuario | ❌ No         |
| POST   | `/auth/token`      | Login / obtener JWT     | ❌ No         |
| POST   | `/auth/verify-otp` | Verificar código OTP    | ❌ No         |
| POST   | `/auth/resend-otp` | Reenviar código OTP     | ❌ No         |
| GET    | `/auth/me`         | Obtener usuario actual  | ✅ Sí         |

### Usuarios (`/users`)

| Método | Endpoint           | Descripción            | Autenticación | Rol           |
| ------ | ------------------ | ---------------------- | ------------- | ------------- |
| GET    | `/users/`          | Listar usuarios        | ✅ Sí         | Administrador |
| GET    | `/users/{user_id}` | Obtener usuario por ID | ✅ Sí         | Administrador |
| GET    | `/users/me`        | Obtener usuario actual | ✅ Sí         | Cualquiera    |

### Conferencias (`/conferences`)

| Método | Endpoint            | Descripción    | Autenticación | Rol           |
| ------ | ------------------- | -------------- | ------------- | ------------- |
| GET    | `/conferences/`     | Listar todas   | ❌ No         | -             |
| GET    | `/conferences/{id}` | Obtener por ID | ❌ No         | -             |
| POST   | `/conferences/`     | Crear          | ✅ Sí         | Administrador |
| PUT    | `/conferences/{id}` | Actualizar     | ✅ Sí         | Administrador |
| DELETE | `/conferences/{id}` | Eliminar       | ✅ Sí         | Administrador |

### Conferencistas (`/speakers`)

| Método | Endpoint         | Descripción    | Autenticación | Rol           |
| ------ | ---------------- | -------------- | ------------- | ------------- |
| GET    | `/speakers/`     | Listar todos   | ❌ No         | -             |
| GET    | `/speakers/{id}` | Obtener por ID | ❌ No         | -             |
| POST   | `/speakers/`     | Crear          | ✅ Sí         | Administrador |
| PUT    | `/speakers/{id}` | Actualizar     | ✅ Sí         | Administrador |
| DELETE | `/speakers/{id}` | Eliminar       | ✅ Sí         | Administrador |

### Sesiones de Agenda (`/sessions`)

| Método | Endpoint           | Descripción       | Autenticación | Rol           |
| ------ | ------------------ | ----------------- | ------------- | ------------- |
| GET    | `/sessions/`       | Listar todas      | ❌ No         | -             |
| GET    | `/sessions/agenda` | Agenda organizada | ❌ No         | -             |
| POST   | `/sessions/`       | Crear             | ✅ Sí         | Administrador |
| PUT    | `/sessions/{id}`   | Actualizar        | ✅ Sí         | Administrador |
| DELETE | `/sessions/{id}`   | Eliminar          | ✅ Sí         | Administrador |

### Eventos Calendario (`/calendar`)

| Método | Endpoint         | Descripción    | Autenticación | Rol           |
| ------ | ---------------- | -------------- | ------------- | ------------- |
| GET    | `/calendar/`     | Listar eventos | ✅ Sí         | Cualquiera    |
| GET    | `/calendar/{id}` | Obtener por ID | ✅ Sí         | Cualquiera    |
| POST   | `/calendar/`     | Crear evento   | ✅ Sí         | Administrador |
| PUT    | `/calendar/{id}` | Actualizar     | ✅ Sí         | Administrador |
| DELETE | `/calendar/{id}` | Eliminar       | ✅ Sí         | Administrador |

### Agenda del Estudiante (`/student-agenda`)

| Método | Endpoint                          | Descripción             | Autenticación |
| ------ | --------------------------------- | ----------------------- | ------------- |
| GET    | `/student-agenda/`                | Obtener agenda personal | ✅ Sí         |
| POST   | `/student-agenda/{conference_id}` | Agregar conferencia     | ✅ Sí         |
| DELETE | `/student-agenda/{conference_id}` | Remover conferencia     | ✅ Sí         |

### Inscripciones a Sesiones (`/agenda-inscriptions`)

| Método | Endpoint                                          | Descripción          | Autenticación |
| ------ | ------------------------------------------------- | -------------------- | ------------- |
| GET    | `/agenda-inscriptions/`                           | Sesiones inscritas   | ✅ Sí         |
| POST   | `/agenda-inscriptions/{session_id}`               | Inscribirse          | ✅ Sí         |
| DELETE | `/agenda-inscriptions/{session_id}`               | Cancelar inscripción | ✅ Sí         |
| GET    | `/agenda-inscriptions/session/{session_id}/count` | Contar inscritos     | ❌ No         |

### Asistencia (`/attendance`)

| Método | Endpoint                                 | Descripción                   | Autenticación |
| ------ | ---------------------------------------- | ----------------------------- | ------------- |
| GET    | `/attendance/`                           | Registro de asistencia        | ✅ Sí         |
| POST   | `/attendance/conference/{conference_id}` | Registrar asistencia (Conf)   | ✅ Sí         |
| POST   | `/attendance/session/{session_id}`       | Registrar asistencia (Sesión) | ✅ Sí         |

## 🔑 Autenticación

### Flujo de Autenticación

1. **Registro**:

   ```bash
   POST /auth/register
   {
     "full_name": "Juan Pérez",
     "email": "juan@example.com",
     "password": "SecurePass123!",
     "role": "usuario_registrado"
   }
   ```

   → Retorna el código OTP en la terminal

2. **Verificar OTP**:

   ```bash
   POST /auth/verify-otp?email=juan@example.com&code=123456
   ```

   → Activa la cuenta del usuario

3. **Login**:

   ```bash
   POST /auth/token
   {
     "email": "juan@example.com",
     "password": "SecurePass123!"
   }
   ```

   → Retorna `access_token` (JWT)

4. **Usar Token**:
   ```bash
   GET /auth/me
   Authorization: Bearer <access_token>
   ```

### Roles

- **super_admin**: Acceso completo a CRUD de todas las entidades
- **web_master**: Igual a super_admin (staff)
- **usuario_registrado**: Acceso limitado (ver conferencias, inscribirse, marcar asistencia)

## 📧 Sistema OTP

### Estado Actual

El sistema OTP está **TEMPORALMENTE SIMULADO** para facilitar el desarrollo sin requerir configuración de email.

### Comportamiento

1. Cuando un usuario **se registra** → código OTP aparece en la terminal del backend
2. Usuario copia código de terminal e ingresa en el frontend
3. El código se valida localmente y ya funciona completamente

### Migración Futura

En la **fase final**, la verificación OTP será manejada por un **microservicio dedicado** que:

- Enviará emails reales
- Manejará reintentos
- Gestionará rate limiting
- Será independiente del API principal

### Para Agregar Credenciales de Email (Futuro)

1. Obtener App Password de Gmail
2. Actualizar `.env` con las credenciales
3. Descomentar import de `aiosmtplib` en `requirements.txt`
4. Restaurar métodos originales en `email_service.py`

## 📊 Modelos de Datos

### User

```python
{
  "_id": "ObjectId",
  "full_name": "string",
  "email": "string (único)",
  "hashed_password": "string",
  "role": "super_admin | web_master | usuario_registrado",
  "is_verified": "boolean",
  "is_active": "boolean",
  "created_at": "datetime"
}
```

### Conference

```python
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "start_at": "datetime",
  "end_at": "datetime",
  "location": "string",
  "capacity": "int (opcional)",
  "speakers": ["speaker_id"]
}
```

### Session

```python
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "day": "string (e.g., 'Día 1')",
  "start_time": "string (HH:MM)",
  "end_time": "string (HH:MM)",
  "location": "string",
  "capacity": "int (opcional)",
  "speaker_id": "ObjectId (opcional)"
}
```

### Speaker

```python
{
  "_id": "ObjectId",
  "name": "string",
  "title": "string",
  "bio": "string",
  "photo_url": "string (opcional)"
}
```

### CalendarEvent

```python
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string (opcional)",
  "start_at": "datetime",
  "end_at": "datetime",
  "audience": "todos | registrados | staff",
  "is_announcement": "boolean",
  "creator_id": "ObjectId"
}
```

## 🖥️ Desarrollo

### Estructura del Proyecto

```
back-end/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Aplicación FastAPI principal
│   ├── config.py               # Configuraciones y variables de entorno
│   ├── auth.py                 # Funciones de autenticación (JWT, passwords)
│   ├── db.py                   # Conexión a MongoDB
│   ├── models.py               # Modelos Pydantic
│   ├── email_service.py        # Servicio OTP simulado
│   └── routes/
│       ├── auth.py             # Endpoints de autenticación
│       ├── users.py            # Endpoints de usuarios
│       ├── sessions.py         # Endpoints de sesiones
│       ├── speakers.py         # Endpoints de conferencistas
│       ├── calendar.py         # Endpoints de calendario
│       ├── conferences.py      # Endpoints de conferencias
│       ├── student_agenda.py   # Endpoints de agenda personal
│       ├── agenda_inscriptions.py # Endpoints de inscripciones
│       └── attendance.py       # Endpoints de asistencia
├── requirements.txt            # Dependencias de Python
├── pyproject.toml              # Configuración del proyecto
├── .env                        # Variables de entorno
└── README.md                   # Este archivo
```

### Agregar un Nuevo Endpoint

1. Crear función en el router correspondiente (`app/routes/*.py`)
2. Usar decoradores `@router.get()`, `@router.post()`, etc.
3. Agregar autenticación con `Depends(get_current_user)` si es necesario
4. Importar router en `main.py`: `app.include_router(nuevo_router)`

### Testing de Endpoints

Usar la documentación Swagger automática:

```bash
http://localhost:8000/docs
```

Aquí puedes probar todos los endpoints directamente.

### Base de Datos

MongoDB se usa con el driver async **Motor**. Las colecciones se crean automáticamente.

Colecciones principales:

- `users` - Usuarios del sistema
- `otps` - Códigos OTP temporales
- `conferences` - Conferencias principales
- `speakers` - Información de conferencistas
- `sessions` - Sesiones de la agenda
- `calendar_events` - Eventos del calendario
- `student_agendas` - Agendas personales
- `agenda_inscriptions` - Inscripciones a sesiones
- `attendance` - Registros de asistencia

## 🐛 Troubleshooting

### Error: `connection refused` en MongoDB

- Verificar que MongoDB está corriendo: `mongosh` en terminal
- Si no está instalado, instalar desde https://www.mongodb.com/try

### Error: 401 Unauthorized

- Verificar que el token está en el header `Authorization: Bearer <token>`
- Tokens expiran tras 60 minutos (configurable en `.env`)
- Re-hacer login para obtener nuevo token

### Error: 403 Forbidden

- Usuario no tiene permisos para esta acción
- Rol requiere ser `super_admin` o `web_master`

### OTP no aparece en terminal

- Verifcar que el backend está corriendo en la terminal correcta
- El código aparece cuando el usuario se registra o solicita reenvío
- Código válido por 10 minutos

## 📝 Licencia

Este proyecto es parte del sistema CONIITI Conference.

## 👥 Contacto

Para preguntas o problemas, contactar al equipo de desarrollo.

---

**Última actualización**: Abril 2026
**Versión API**: 0.1.0
**Estado OTP**: 🔄 Temporalmente Simulado (Microservicio en progreso)

### Conferencistas

- `GET /speakers/` - Lista todos los conferencistas
- `POST /speakers/` - Crear conferencista (admin)
- `PUT /speakers/{id}` - Actualizar conferencista (admin)
- `DELETE /speakers/{id}` - Eliminar conferencista (admin)

### Calendario

- `GET /calendar/` - Eventos del calendario (filtrados por rol)
- `POST /calendar/` - Crear evento (staff)
- `POST /calendar/{id}/attend` - Marcar asistencia
- `DELETE /calendar/{id}/attend` - Cancelar asistencia

### Conferencias

- `GET /conferences/` - Lista todas las conferencias
- `POST /conferences/` - Crear conferencia (staff)
- `PUT /conferences/{id}` - Actualizar conferencia
- `DELETE /conferences/{id}` - Eliminar conferencia

### Agenda de Estudiantes

- `GET /student-agenda/` - Agenda personal del estudiante
- `POST /student-agenda/{conference_id}` - Agregar a agenda
- `DELETE /student-agenda/{conference_id}` - Remover de agenda

### Inscripciones a Agenda

- `GET /agenda-inscriptions/` - Inscripciones del usuario
- `POST /agenda-inscriptions/{session_id}` - Inscribirse a sesión
- `DELETE /agenda-inscriptions/{session_id}` - Cancelar inscripción
- `GET /agenda-inscriptions/session/{id}/count` - Contar inscripciones

### Asistencia

- `GET /attendance/` - Registro de asistencia del usuario
- `POST /attendance/conference/{id}` - Registrar asistencia a conferencia
- `POST /attendance/session/{id}` - Registrar asistencia a sesión
- `GET /attendance/qr/{token}` - Validar token QR
- `GET /attendance/conference/{id}/attendees` - Lista de asistentes (staff)

## Inicialización

### 1. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus credenciales:

```bash
cp .env.example .env
```

Edita `.env` con tus valores reales:

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=produccion_db

# JWT
JWT_SECRET_KEY=tu-clave-secreta-muy-segura

# Email SMTP (Gmail gratuito)
SMTP_USERNAME=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password-de-16-caracteres
```

#### Configuración de Gmail SMTP (Gratuito)

1. **Habilitar autenticación de 2 factores** en tu cuenta Gmail
2. **Generar una contraseña de aplicación**:
   - Ve a [Google Account Settings](https://myaccount.google.com/)
   - Seguridad → Verificación en 2 pasos → Contraseñas de aplicación
   - Selecciona "Mail" y "Otro (nombre personalizado)"
   - Copia la contraseña generada (16 caracteres)

3. **Configurar variables de entorno**:
   ```env
   SMTP_USERNAME=tu-email@gmail.com
   SMTP_PASSWORD=abcd-efgh-ijkl-mnop  # La contraseña de aplicación
   SMTP_FROM_EMAIL=tu-email@gmail.com
   ```

### 3. Inicializar base de datos completa

```bash
python init_db.py
```

Este comando crea:

- Usuarios por defecto (super_admin, web_master, usuario_registrado)
- Sesiones de agenda de ejemplo
- Conferencistas registrados
- Conferencias adicionales

### 4. Ejecutar servidor

```bash
uvicorn app.main:app --reload
```

## 📧 Sistema de Email OTP

### Características

- ✅ **Envío gratuito** usando Gmail SMTP
- ✅ **Emails HTML** con diseño profesional
- ✅ **Reenvío de OTP** si expira
- ✅ **Emails de bienvenida** tras verificación
- ✅ **Fallback seguro** si falla el envío

### Plantillas de Email

1. **OTP de verificación**: Código de 6 dígitos con expiración
2. **Email de bienvenida**: Confirmación de cuenta verificada

### Configuración de Seguridad

- **TLS encryption** (puerto 587)
- **App passwords** en lugar de contraseña real
- **Un solo uso** de códigos OTP
- **Expiración temporal** (10 minutos)

```bash
uvicorn app.main:app --reload
```

## Documentación API

Una vez ejecutado el servidor, visita `http://localhost:8000/docs` para ver la documentación interactiva de FastAPI.

## Seguridad

- Autenticación JWT con roles
- Validación de permisos por endpoint
- Sistema OTP para verificación de usuarios
- Control de acceso basado en roles (usuario_registrado, web_master, super_admin)

## Base de Datos

Utiliza MongoDB con las siguientes colecciones:

- `users` - Usuarios del sistema
- `otps` - Códigos OTP temporales
- `sessions` - Sesiones de la agenda
- `speakers` - Conferencistas
- `calendar_events` - Eventos del calendario
- `conferences` - Conferencias adicionales
- `student_agenda` - Agenda personal de estudiantes
- `agenda_inscriptions` - Inscripciones a sesiones
- `attendance` - Registros de asistencia
