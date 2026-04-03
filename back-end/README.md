# Backend API - CONIITI Conference System

API REST completa para el sistema de conferencias CONIITI, construida con FastAPI y MongoDB.

## Colecciones Implementadas

### 1. Autenticación y Usuarios

- **Usuarios**: Gestión de usuarios con roles (super_admin, web_master, usuario_registrado)
- **OTP**: Sistema de verificación por código OTP

### 2. Agenda y Sesiones

- **Sessions**: Sesiones de la agenda principal con horarios, speakers, ubicaciones
- **Agenda Inscriptions**: Inscripciones de usuarios a sesiones específicas

### 3. Conferencistas

- **Speakers**: Información completa de los conferencistas (bio, redes sociales, tracks)

### 4. Calendario

- **Calendar Events**: Eventos personalizados del calendario con sistema de asistencia

### 5. Conferencias Adicionales

- **Conferences**: Conferencias adicionales más allá de la agenda fija

### 6. Gestión de Estudiantes

- **Student Agenda**: Agenda personal de estudiantes para conferencias
- **Attendance**: Sistema de asistencia con tokens QR

## Endpoints Principales

### Autenticación

- `POST /auth/register` - Registro de usuario
- `POST /auth/verify-otp` - Verificación OTP
- `POST /auth/token` - Login
- `GET /auth/me` - Información del usuario actual

### Sesiones de Agenda

- `GET /sessions/` - Lista todas las sesiones
- `GET /sessions/agenda` - Agenda completa organizada por días
- `POST /sessions/` - Crear sesión (admin)
- `PUT /sessions/{id}` - Actualizar sesión (admin)
- `DELETE /sessions/{id}` - Eliminar sesión (admin)

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
