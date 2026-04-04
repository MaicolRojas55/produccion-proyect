# Producción Conference - Frontend

Interfaz de usuario moderna para la plataforma de conferencias CONIITI, construida con **React 18**, **Vite**, **TypeScript** y **Tailwind CSS**.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tech Stack](#tech-stack)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Client](#api-client)
- [Flujos Principales](#flujos-principales)
- [Desarrollo](#desarrollo)

## ✨ Características

- 🔐 **Autenticación Completa** - Login, registro, OTP verification
- 👤 **Gestión de Roles** - Super Admin, Web Master, Usuario Registrado
- 📅 **Calendario de Conferencias** - Visualización interactiva
- 👥 **Gestión de Conferencistas** - Información y biografías
- 📝 **Inscripción a Eventos** - Agregar/remover de agenda personal
- ✅ **Registro de Asistencia** - Código QR para check-in
- 📊 **Dashboard de Administrador** - CRUD completo de entidades
- 🎨 **UI/UX Moderna** - Componentes Shadcn/UI y Tailwind CSS
- 📱 **Responsive Design** - Funciona en escritorio y móvil
- ⚡ **Rendimiento Optimizado** - Vite con hot reload

## 🛠️ Tech Stack

| Categoría               | Tecnología      | Versión |
| ----------------------- | --------------- | ------- |
| **Framework**           | React           | 18.3.1  |
| **Build Tool**          | Vite            | 5.4     |
| **Lenguaje**            | TypeScript      | 5.8     |
| **Estilos**             | Tailwind CSS    | 3.x     |
| **Componentes**         | Shadcn/UI       | Latest  |
| **Routing**             | React Router    | 6.x     |
| **Formularios**         | React Hook Form | -       |
| **Toast Notifications** | Sonner          | -       |
| **Testing**             | Vitest          | -       |

## 🔧 Requisitos

- **Node.js** 18+ o **Bun** 1.0+
- **npm** o **bun** (gestor de paquetes)
- Backend corriendo en `http://localhost:8000`
- MongoDB disponible para el backend

## 📦 Instalación

### 1. Navegar al directorio del frontend

```bash
cd front-end
```

### 2. Instalar dependencias

```bash
# Con npm
npm install

# Con bun (recomendado por el proyecto)
bun install
```

### 3. Crear archivo .env

Crear archivo `.env` en el directorio `front-end/`:

```env
# API Backend
VITE_API_URL=http://localhost:8000

# Entorno
VITE_ENVIRONMENT=development
VITE_API_TIMEOUT=30000
```

### 4. Iniciar servidor de desarrollo

```bash
# Con npm
npm run dev

# Con bun
bun run dev
```

El frontend estará disponible en: `http://localhost:5173`

## ⚙️ Configuración

### Variables de Entorno

Archivo `.env`:

```env
# URL base de la API del backend
VITE_API_URL=http://localhost:8000

# Entorno: development, staging, production
VITE_ENVIRONMENT=development

# Timeout para peticiones HTTP (en ms)
VITE_API_TIMEOUT=30000
```

### Configuración de TypeScript

El proyecto usa **tsconfig.json** con:

- `"strict": false` - Lenient type checking durante desarrollo
- `"baseUrl": "."` - Rutas relativas desde raíz
- `"paths": {"@/*": ["./src/*"]}` - Alias para imports

### CORS y Seguridad

El backend está configurado para aceptar requests desde:

- `http://localhost:3000`
- `http://localhost:5173` (puerto Vite)
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

## 🚀 Uso

### Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Previewar build de producción localmente
npm run preview

# Ejecutar linter (ESLint)
npm run lint

# Ejecutar tests
npm run test

# Watch mode para tests
npm run test:watch
```

## 📁 Estructura del Proyecto

```
front-end/
├── src/
│   ├── components/
│   │   ├── layout/              # Componentes de layout (navbar, sidebar)
│   │   │   ├── AppNavbar.tsx
│   │   │   └── NavLink.tsx
│   │   ├── shared/              # Componentes compartidos
│   │   │   ├── AgendaHero.tsx
│   │   │   ├── SessionCard.tsx
│   │   │   ├── BotonRegistro.tsx
│   │   │   └── TechBackground.tsx
│   │   └── ui/                  # Componentes Shadcn/UI
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── form.tsx
│   │       └── ... (otros componentes)
│   ├── features/
│   │   ├── auth/                # Autenticación
│   │   │   ├── AuthContext.tsx  # Contexto de auth
│   │   │   ├── types.ts         # Tipos de auth
│   │   │   └── storage.ts       # Persistencia
│   │   ├── calendar/            # Calendario
│   │   ├── conference/          # Conferencias
│   │   ├── content/             # Contenido dinámico
│   │   ├── device/              # Device utilities
│   │   ├── otp/                 # Lógica OTP
│   │   └── student-qr/          # QR para estudiantes
│   ├── pages/                   # Páginas/Rutas principales
│   │   ├── Auth.tsx             # Página de login/registro
│   │   ├── Agenda.tsx           # Agenda de sesiones
│   │   ├── StudentPortal.tsx    # Portal de estudiante
│   │   ├── Conferencistas.tsx   # Gestión de speakers
│   │   ├── CalendarPage.tsx     # Calendario
│   │   ├── SuperAdminDashboard.tsx # Dashboard admin
│   │   ├── WebMasterDashboard.tsx  # Dashboard web master
│   │   ├── AppGate.tsx          # Protección de rutas
│   │   ├── Index.tsx            # Página inicial
│   │   └── NotFound.tsx         # 404
│   ├── hooks/
│   │   ├── use-toast.ts         # Toast notifications
│   │   ├── use-mobile.tsx       # Detección de mobile
│   │   ├── use-countdown.ts     # Contador regresivo
│   │   └── useFormValidation.ts # Validaciones de formulario
│   ├── lib/
│   │   ├── api.ts               # Cliente API REST
│   │   └── utils.ts             # Utilidades
│   ├── data/
│   │   └── agendaData.ts        # Datos de ejemplo
│   ├── test/
│   │   ├── setup.ts             # Setup de tests
│   │   └── example.test.ts      # Tests de ejemplo
│   ├── App.tsx                  # Componente raíz
│   ├── App.css                  # Estilos globales
│   ├── main.tsx                 # Punto de entrada
│   ├── index.css                # Estilos Tailwind
│   └── vite-env.d.ts            # Tipos de Vite
├── public/                      # Archivos estáticos
├── .env                         # Variables de entorno (local)
├── .env.example                 # Plantilla de variables
├── vite.config.ts               # Configuración Vite
├── vitest.config.ts             # Configuración tests
├── tailwind.config.ts           # Configuración Tailwind
├── tsconfig.json                # Configuración TypeScript
├── package.json                 # Dependencias y scripts
├── eslint.config.js             # Configuración ESLint
├── components.json              # Configuración Shadcn/UI
└── README.md                    # Este archivo
```

## 🔌 API Client

El archivo `src/lib/api.ts` proporciona un cliente HTTP completo para comunicarse con el backend:

### Métodos Disponibles

#### Autenticación

```typescript
// Registro
await apiClient.register({
  full_name: 'Juan Pérez',
  email: 'juan@example.com',
  password: 'pass123',
  role: 'usuario_registrado'
})

// Login
await apiClient.login({
  email: 'juan@example.com',
  password: 'pass123'
})

// Verificar OTP
await apiClient.verifyOTP('juan@example.com', '123456')

// Reenviar OTP
await apiClient.resendOTP('juan@example.com')

// Obtener usuario actual
await apiClient.getCurrentUser()

// Logout
apiClient.logout()
```

#### Conferencias

```typescript
// Listar todas
await apiClient.getConferences()

// Obtener una específica
await apiClient.getConference("conference_id")

// Crear (requiere autenticación admin)
await apiClient.createConference({...})

// Actualizar
await apiClient.updateConference("conference_id", {...})

// Eliminar
await apiClient.deleteConference("conference_id")
```

#### Conferencistas

```typescript
await apiClient.getSpeakers()
await apiClient.getSpeaker("speaker_id")
await apiClient.createSpeaker({...})
await apiClient.updateSpeaker("speaker_id", {...})
await apiClient.deleteSpeaker("speaker_id")
```

#### Sesiones

```typescript
await apiClient.getSessions()
await apiClient.getSessionsAgenda()
await apiClient.createSession({...})
await apiClient.updateSession("session_id", {...})
await apiClient.deleteSession("session_id")
```

#### Calendario

```typescript
await apiClient.getCalendarEvents()
await apiClient.getCalendarEvent("event_id")
await apiClient.createCalendarEvent({...})
await apiClient.updateCalendarEvent("event_id", {...})
await apiClient.deleteCalendarEvent("event_id")
```

#### Agenda de Estudiante

```typescript
await apiClient.getStudentAgenda()
await apiClient.addToStudentAgenda('conference_id')
await apiClient.removeFromStudentAgenda('conference_id')
```

#### Inscripciones

```typescript
await apiClient.getAgendaInscriptions()
await apiClient.enrollInSession('session_id')
await apiClient.cancelSessionEnrollment('session_id')
await apiClient.getSessionEnrollmentCount('session_id')
```

#### Asistencia

```typescript
await apiClient.getAttendance()
await apiClient.registerConferenceAttendance('conference_id')
await apiClient.registerSessionAttendance('session_id')
```

### Manejo de Errores

```typescript
import { apiClient, ApiError } from '@/lib/api'

try {
  await apiClient.login({...})
} catch (error) {
  if (error instanceof ApiError) {
    if (error.isUnauthorized()) {
      // Credenciales inválidas
    }
    if (error.isForbidden()) {
      // Permisos insuficientes
    }
    if (error.isNotFound()) {
      // Recurso no encontrado
    }
    if (error.isNetworkError()) {
      // Error de conexión
    }
  }
}
```

## 🔐 Autenticación y Contexto

### AuthContext

El contexto `src/features/auth/AuthContext.tsx` maneja:

- **Gestión de sesión**: Login, logout, registro
- **Token JWT**: Almacenamiento seguro en localStorage
- **Usuario actual**: Datos del usuario autenticado
- **Roles**: Verificación de permisos

### Uso en Componentes

```typescript
import { useAuth } from '@/features/auth/AuthContext'

function MiComponente() {
  const { user, isAuthenticated, login, logout } = useAuth()

  return (
    <div>
      {isAuthenticated ? (
        <p>Bienvenido, {user?.full_name}</p>
      ) : (
        <p>Por favor, inicia sesión</p>
      )}
    </div>
  )
}
```

### Protección de Rutas

El componente `AppGate.tsx` protege rutas requiriendo autenticación:

```typescript
<Route element={<AppGate />}>
  <Route path="/agenda" element={<Agenda />} />
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

## 📱 Páginas Principales

### Auth.tsx - Autenticación

- Login de usuarios
- Registro de nuevos usuarios
- Verificación OTP
- Validación de formularios en tiempo real

### StudentPortal.tsx - Portal de Estudiante

- Ver conferencias disponibles
- Agregar/remover de agenda personal
- Historial de asistencia

### Agenda.tsx - Agenda de Sesiones

- Ver sesiones de la agenda
- Inscribirse a sesiones
- Ver capacidad disponible

### Conferencistas.tsx - Gestión de Speakers

- Ver lista de conferencistas
- Información biográfica e imágenes
- CRUD para administradores

### SuperAdminDashboard.tsx - Dashboard Admin

- Gestión completa de conferencias
- Gestión de sesiones
- Gestión de conferencistas
- Ver usuarios registrados

## 🎨 Componentes UI

El proyecto usa componentes de **Shadcn/UI**:

- `Button` - Botones reutilizables
- `Card` - Tarjetas de contenido
- `Dialog` - Modales
- `Form` - Formularios con validación
- `Input` - Campos de entrada
- `Select` - Dropdowns
- `Toast` - Notificaciones
- Y más...

## 🧪 Testing

### Ejecutar Tests

```bash
# Tests de una sola ejecución
npm run test

# Watch mode (reejecutar al cambiar archivos)
npm run test:watch
```

### Archivos de Test

Los tests están en `src/test/` con extensión `.test.ts` o `.test.tsx`

### Ejemplo de Test

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

## 🔄 Flujos Principales

### Flujo de Registro

```
1. Usuario navega a /auth
2. Completa formulario de registro
3. Se envía POST /auth/register → backend
4. Backend retorna OTP en terminal
5. Usuario copia código y lo verifica
6. POST /auth/verify-otp → backend activa cuenta
7. Usuario puede hacer login
```

### Flujo de Login

```
1. Usuario navega a /auth
2. Ingresa email y contraseña
3. POST /auth/token → backend valida credenciales
4. Backend retorna JWT token
5. Frontend guarda token en localStorage
6. Usuario redirigido a /agenda o dashboard según rol
```

### Flujo de Inscripción a Evento

```
1. Usuario autenticado ve lista de conferencias
2. Click en "Agregar a Agenda"
3. POST /student-agenda/{conference_id} → backend
4. Backend verifica disponibilidad y crea inscripción
5. Conferencia se muestra en agenda personal
```

## 🧠 Hooks Personalizados

### useAuth

```typescript
const { user, isAuthenticated, login, logout, register } = useAuth()
```

### useToast

```typescript
const { toast } = useToast()

toast({
  title: 'Éxito',
  description: 'Operación realizada'
})
```

### useMobile

```typescript
const isMobile = useMobile()

return isMobile ? <MobileView /> : <DesktopView />
```

### useCountdown

```typescript
const { seconds, isActive, start, stop } = useCountdown(60)
```

## ⚙️ Desarrollo

### Agregar un Nuevo Componente UI

```bash
npx shadcn-ui@latest add [component-name]
```

Los componentes se crean en `src/components/ui/`

### Agregar una Nueva Página

1. Crear archivo en `src/pages/MiPagina.tsx`
2. Agregar ruta en `App.tsx`
3. Importar y configure en el router

### Agregar una Nueva Entidad de API

1. Agregar tipos en `src/lib/api.ts`
2. Agregar métodos en clase `ApiClient`
3. Usar en componentes con `apiClient.getEntidades()`

### Mejores Prácticas

- ✅ Usar TypeScript - Aprovechar el type checking
- ✅ Componentes pequeños - Un responsabilidad por componente
- ✅ Estados con Context - Para datos globales
- ✅ Manejo de errores - Siempre capturar excepciones
- ✅ Loading states - Mostrar feedback al usuario
- ✅ Validación - Cliente y servidor

## 🐛 Troubleshooting

### Error: "VITE_API_URL is undefined"

- Crear archivo `.env` en `front-end/`
- Asegurarse que `VITE_API_URL=http://localhost:8000` está configurado
- Reiniciar servidor con `npm run dev`

### Error: "Backend not responding"

- Verificar que backend está corriendo en `http://localhost:8000`
- Ejecutar backend con: `uvicorn app.main:app --reload`
- Verificar CORS en backend está habilitado

### Error: 401 Unauthorized en APIs protegidas

- Verificar que token está en localStorage
- Ejecutar login nuevamente para obtener nuevo token
- Verificar que token no expiró (60 minutos)

### Error: Port 5173 already in use

```bash
# Esperar a que el proceso termine o
# Usar otro puerto:
npm run dev -- --port 5174
```

## 📚 Recursos

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn/UI Components](https://ui.shadcn.com/)
- [React Router v6](https://reactrouter.com/)

## 📝 Licencia

Este proyecto es parte del sistema CONIITI Conference.

## 👥 Contacto

Para preguntas o problemas, contactar al equipo de desarrollo.

---

**Última actualización**: Abril 2026
**Versión Frontend**: 1.0.0
**Estado API Integration**: ✅ Completa

````

3. **Ejecutar el servidor de desarrollo:**

```bash
npm run dev
# o bien:
bun run dev
````

El servidor iniciará, usualmente en la dirección [http://localhost:5173](http://localhost:5173). La recarga en caliente (HMR) está habilitada por defecto.

## 📜 Scripts Disponibles

En el directorio del proyecto puedes ejecutar los siguientes comandos:

| Comando              | Descripción                                                                |
| -------------------- | -------------------------------------------------------------------------- |
| `npm run dev`        | Inicia el servidor de desarrollo local usando Vite.                        |
| `npm run build`      | Construye la aplicación optimizada para producción (en la carpeta `dist`). |
| `npm run preview`    | Levanta un servidor para previsualizar la compilación local de producción. |
| `npm run lint`       | Analiza el código buscando errores de sintaxis y formato con ESLint.       |
| `npm run test`       | Ejecuta las pruebas unitarias usando Vitest.                               |
| `npm run test:watch` | Ejecuta las pruebas en modo observador o watch.                            |

## 🌐 Conexión con el Backend

Este frontend está diseñado para consumir la API de backend (habitualmente desarrollada en FastAPI/Python para este proyecto).
Asegúrate de que el backend esté corriendo y sea accesible para que características como la autenticación o la carga de datos funcionen correctamente.

> **Nota para configuración de entornos:** Puedes configurar y centralizar la URL base de tu API usando variables de entorno (`.env`), por ejemplo:
> `VITE_API_BASE_URL="http://localhost:8000"`

## 🔐 Sistema de Autenticación y Validaciones

### Características de Autenticación

- ✅ **Registro con OTP por email** (integración real con backend)
- ✅ **Verificación de email** con códigos de 6 dígitos
- ✅ **Reenvío de OTP** si expira
- ✅ **Login con JWT** tokens
- ✅ **Validaciones en tiempo real** de formularios
- ✅ **Feedback visual** de errores y estados

### Validaciones Implementadas

#### Formulario de Registro

- **Email**: Formato válido, dominio existente, unicidad
- **Contraseña**: Mínimo 8 caracteres, mayúsculas, minúsculas, números, símbolos
- **Nombre completo**: Solo letras y espacios, mínimo 2 caracteres
- **Teléfono**: Formato colombiano (+57), 10 dígitos
- **Términos y condiciones**: Requerido aceptar

#### Formulario de Login

- **Email**: Formato válido
- **Contraseña**: No vacía

#### Verificación OTP

- **Código**: Exactamente 6 dígitos numéricos
- **Expiración**: 10 minutos desde envío
- **Un solo uso**: Código se invalida tras uso

### Componentes de Validación

- **`ValidatedInput`**: Input con validación en tiempo real y mensajes de error
- **`useFormValidation`**: Hook personalizado con todas las reglas de validación
- **`useApi`**: Cliente API con manejo de errores y estados de carga

### Estados de UI

- **Loading states**: Spinners durante llamadas API
- **Error handling**: Mensajes de error específicos y amigables
- **Success feedback**: Confirmaciones visuales con toasts
- **Form states**: Campos deshabilitados durante envío, estados de éxito/error

### Seguridad

- **Validación del lado cliente**: Previene envíos inválidos
- **Sanitización**: Limpieza de inputs antes del envío
- **Rate limiting**: Prevención de spam en reenvío de OTP
- **Token storage**: Almacenamiento seguro de JWT en localStorage

---

**Desarrollado y mantenido para el sistema de Producción y Gestión.**
