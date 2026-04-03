# 🏛️ Sistema CONIITI - Producción y Gestión

Sistema completo de gestión para conferencias CONIITI, compuesto por backend API REST y frontend React moderno.

## 📋 Descripción General

Este proyecto implementa un sistema integral para la gestión de conferencias académicas, incluyendo:

- **Autenticación completa** con verificación OTP por email
- **Gestión de usuarios** con roles jerárquicos (Super Admin, Web Master, Usuario Registrado)
- **Agenda de conferencias** con sesiones organizadas por días
- **Sistema de conferencistas** con información detallada
- **Calendario de eventos** con control de asistencia
- **Portal de estudiantes** con agenda personal
- **Sistema QR** para registro de asistencia

## 🏗️ Arquitectura

### Backend (FastAPI + MongoDB)

- **API REST** con documentación automática
- **Base de datos** NoSQL con MongoDB
- **Autenticación JWT** con refresh tokens
- **Email OTP** gratuito usando Gmail SMTP
- **Validación Pydantic** de datos
- **CORS** configurado para frontend

### Frontend (React + TypeScript)

- **SPA moderna** con React 18
- **TypeScript** para type safety
- **Tailwind CSS** + shadcn/ui para estilos
- **Validaciones en tiempo real** de formularios
- **API client** con manejo de errores
- **Responsive design** para móviles y desktop

## 🚀 Inicio Rápido

### Prerrequisitos

- **Python 3.8+** para el backend
- **Node.js 16+** o **Bun** para el frontend
- **MongoDB** corriendo localmente o en la nube
- **Cuenta Gmail** para envío de emails OTP

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd produccion-proyect
```

### 2. Configurar Backend

```bash
cd back-end

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales reales

# Inicializar base de datos
python init_db.py

# Ejecutar servidor
uvicorn app.main:app --reload
```

### 3. Configurar Frontend

```bash
cd ../front-end

# Instalar dependencias
npm install
# o
bun install

# Ejecutar servidor de desarrollo
npm run dev
# o
bun run dev
```

### 4. Acceder al sistema

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs

## ⚙️ Configuración Detallada

### Email OTP (Gmail Gratuito)

1. **Habilitar 2FA** en tu cuenta Gmail
2. **Generar App Password**:
   - Google Account → Security → 2-Step Verification → App passwords
   - Seleccionar "Mail" → "Other (custom name)"
3. **Configurar .env**:
   ```env
   SMTP_USERNAME=tu-email@gmail.com
   SMTP_PASSWORD=abcd-efgh-ijkl-mnop
   ```

### Variables de Entorno Backend

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=produccion_db

# JWT
JWT_SECRET_KEY=tu-clave-secreta-muy-segura-aqui

# Email
SMTP_USERNAME=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password-16-caracteres
```

### Variables de Entorno Frontend

```env
VITE_API_BASE_URL=http://localhost:8000
```

## 🔐 Usuarios por Defecto

Después de ejecutar `init_db.py`, estarán disponibles:

| Email                     | Contraseña     | Rol                |
| ------------------------- | -------------- | ------------------ |
| superadmin@coniiti.edu.co | SuperAdmin123! | Super Admin        |
| webmaster@coniiti.edu.co  | WebMaster123!  | Web Master         |
| estudiante@coniiti.edu.co | Estudiante123! | Usuario Registrado |

## 📱 Características Principales

### Autenticación

- ✅ Registro con validación completa
- ✅ Verificación OTP por email
- ✅ Login con JWT
- ✅ Roles y permisos
- ✅ Reenvío de códigos OTP

### Agenda y Sesiones

- ✅ Agenda organizada por días
- ✅ Inscripción a sesiones
- ✅ Información de conferencistas
- ✅ Ubicaciones y horarios

### Gestión de Eventos

- ✅ Calendario personalizado
- ✅ Control de asistencia
- ✅ Sistema QR para estudiantes

### Portal de Estudiantes

- ✅ Agenda personal
- ✅ Registro de asistencia
- ✅ Historial de participación

## 🧪 Testing

### Backend

```bash
cd back-end
python -m pytest
```

### Frontend

```bash
cd front-end
npm run test
```

## 📚 Documentación Adicional

- [Backend API Docs](./back-end/README.md)
- [Frontend Guide](./front-end/README.md)
- [API Endpoints](http://localhost:8000/docs) (cuando el backend esté corriendo)

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

**Desarrollado para la Universidad CONIITI** 🎓</content>
<parameter name="filePath">c:\Users\rojas\Documents\Maicol Rojas\produccion-software\test\produccion-proyect\README.md
