# 🔌 Guía Rápida de Integración Frontend-Backend

Guía para conectar completamente el frontend con los endpoints del backend.

## 📋 Tabla de Contenidos

- [Pre-requisitos](#pre-requisitos)
- [Verificar Conexión](#verificar-conexión)
- [Configurar Variables](#configurar-variables)
- [Testear Endpoints](#testear-endpoints)
- [Flujos Principales](#flujos-principales)
- [Troubleshooting](#troubleshooting)

## ⚙️ Pre-requisitos

### Backend

```bash
cd back-end

# Crear venv
python -m venv venv
venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt

# Crear .env (ya está creado pero verificar)
# Debe contener MONGODB_URI=mongodb://localhost:27017

# MongoDB debe estar corriendo
mongosh
```

### Frontend

```bash
cd front-end

# Instalar dependencias
npm install
# o
bun install

# Crear .env
# VITE_API_URL=http://localhost:8000
```

## 🚀 Verificar Conexión

### 1. Iniciar Backend

```bash
cd back-end
uvicorn app.main:app --reload
```

Debe mostrar:

```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

Verificar endpoints en: `http://localhost:8000/docs`

### 2. Iniciar Frontend

```bash
cd front-end
npm run dev
```

Debe mostrar:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 3. Verificar Conexión

En browser console:

```javascript
// Si está disponible, debe retornar lista de conferencias
fetch('http://localhost:8000/conferences/')
  .then((r) => r.json())
  .then((data) => console.log('✅ Conexión OK:', data))
  .catch((e) => console.error('❌ Error:', e))
```

## 🔐 Configurar Variables de Entorno

### Backend (back-end/.env)

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=produccion_db
JWT_SECRET_KEY=change-this-secret-value
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRES_MINUTES=60
OTP_LENGTH=6
OTP_EXPIRE_MINUTES=10
```

### Frontend (front-end/.env)

```env
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development
VITE_API_TIMEOUT=30000
```

## 🧪 Testear Endpoints

### Swagger UI (Recomendado)

1. Abrir `http://localhost:8000/docs`
2. Click en "Authorize" (si es necesario)
3. Probar endpoints directamente

### Registro + Login

#### 1. Registro (POST /auth/register)

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Juan Test",
    "email": "juan@test.com",
    "password": "Test123!",
    "role": "usuario_registrado"
  }'
```

**Respuesta esperada**:

```json
{
  "message": "Usuario registrado. El código de verificación aparecerá en la terminal del backend.",
  "email_sent": true,
  "otp_id": "..."
}
```

**En Terminal Backend**:

```
🔐 VERIFICACIÓN OTP - CONIITI CONFERENCE
Para: juan@test.com
Tu código: 123456
```

#### 2. Verificar OTP (POST /auth/verify-otp)

```bash
curl -X POST "http://localhost:8000/auth/verify-otp?email=juan@test.com&code=123456"
```

**Respuesta esperada**:

```json
{
  "message": "OTP verificado exitosamente. ¡Bienvenido a CONIITI!"
}
```

#### 3. Login (POST /auth/token)

```bash
curl -X POST "http://localhost:8000/auth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@test.com",
    "password": "Test123!"
  }'
```

**Respuesta esperada**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### 4. Usar Token (GET /auth/me)

```bash
curl -X GET "http://localhost:8000/auth/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Respuesta esperada**:

```json
{
  "_id": "...",
  "full_name": "Juan Test",
  "email": "juan@test.com",
  "role": "usuario_registrado",
  "is_verified": true,
  "is_active": true
}
```

### Testear Conferencias (Sin autenticación)

```bash
# Listar todas
curl http://localhost:8000/conferences/

# Resultado esperado: array vacío [] o lista de conferencias
```

## 🔄 Flujos Principales

### Flujo 1: Registro

```
Frontend (Auth.tsx)
├─ handleRegister() → apiClient.register(data)
├─ Backend /auth/register
│  ├─ Crear usuario en DB
│  ├─ Generar OTP (6 dígitos)
│  ├─ Imprimir en terminal ← VER CÓDIGO AQUÍ
│  └─ Retorna otp_id
├─ Frontend guarda email para siguiente paso
└─ Usuario debe ingresar código de terminal
```

### Flujo 2: Verificar OTP

```
Frontend (Auth.tsx)
├─ handleVerifyOTP() → apiClient.verifyOTP(email, code)
├─ Backend /auth/verify-otp
│  ├─ Busca OTP en DB
│  ├─ Valida que no expiró
│  ├─ Marca usuario como is_verified=true
│  └─ Retorna éxito
├─ Frontend redirige a login
└─ Usuario puede hacer login
```

### Flujo 3: Login

```
Frontend (Auth.tsx)
├─ handleLogin() → apiClient.login(email, password)
├─ Backend /auth/token
│  ├─ Valida email/password
│  ├─ Verifica is_verified=true
│  ├─ Genera JWT token
│  └─ Retorna access_token
├─ Frontend guarda token con apiClient.setToken()
├─ Frontend redirige según rol
│  ├─ super_admin/web_master → /dashboard
│  └─ usuario_registrado → /agenda
└─ User authenticado ✅
```

### Flujo 4: Agregar a Agenda

```
Frontend (StudentPortal.tsx)
├─ listaConferencias = await apiClient.getConferences()
├─ markAgenda(conference_id) → apiClient.addToStudentAgenda(id)
├─ Backend /student-agenda/{id}
│  ├─ Valida usuario está autenticado
│  ├─ Valida usuario_registrado role
│  ├─ Valida capacidad si existe
│  ├─ Crea inscripción en DB
│  └─ Retorna éxito
├─ Frontend recarga agenda
└─ Conferencia aparece en agenda personal ✅
```

## 📝 Ejemplos de Uso en Frontend

### Usar apiClient en un Componente

```typescript
import { apiClient, ApiError } from '@/lib/api'
import { useEffect, useState } from 'react'

export function MisConferencias() {
  const [conferences, setConferences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarConferencias = async () => {
      try {
        const data = await apiClient.getConferences()
        setConferences(data)
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    cargarConferencias()
  }, [])

  if (loading) return <p>Cargando...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      {conferences.map(conf => (
        <div key={conf._id}>
          <h3>{conf.title}</h3>
          <p>{conf.description}</p>
        </div>
      ))}
    </div>
  )
}
```

### Uso con Autenticación

```typescript
import { apiClient } from '@/lib/api'

export function Dashboard() {
  const handleCrearConferencia = async () => {
    try {
      const nueva = await apiClient.createConference({
        title: "Mi Conferencia",
        description: "Descripción",
        start_at: new Date().toISOString(),
        end_at: new Date().toISOString(),
        location: "Sala 1",
        speakers: []
      })
      console.log('Creada:', nueva)
    } catch (error) {
      console.error('Error:', error)
      // Mostrar toast de error
    }
  }

  return <button onClick={handleCrearConferencia}>Crear</button>
}
```

## 🐛 Troubleshooting

### Error: "ECONNREFUSED 127.0.0.1:8000"

**Causa**: Backend no está corriendo

**Solución**:

```bash
cd back-end
uvicorn app.main:app --reload
```

### Error: "401 Unauthorized"

**Causa**: Token no enviado o expirado

**Solución**:

```typescript
// Verificar token
const token = apiClient.getToken()
console.log('Token:', token)

// Si no existe, hacer login nuevamente
if (!token) {
  await apiClient.login({ email, password })
}
```

### Error: "CORS policy"

**Causa**: Frontend en puerto diferente

**Solución**: Backend tiene CORS configurado para localhost:3000 y localhost:5173

Verificar `app/main.py`:

```python
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Vite
]
```

### Error: "400 Bad Request" en /auth/verify-otp

**Causa**: Parámetros query no enviados correctamente

**Solución**: Usar apiClient.verifyOTP() que already maneja query params:

```typescript
// ❌ NO hacer esto:
await apiClient.post('/auth/verify-otp', { email, code })

// ✅ Hacer esto:
await apiClient.verifyOTP(email, code)
```

### OTP no aparece en terminal backend

**Causa**: Backend no está mostrando output

**Solución**:

```bash
# Terminal del backend debe estar abierta y visible
# El código aparece cuando el usuario se registra o pide reenvío
# Formato: 6 dígitos entre bordes de caja de arte ASCII
```

### "Cannot read property 'getConferences'"

**Causa**: apiClient no importado correctamente

**Solución**:

```typescript
// Correcto
import { apiClient } from '@/lib/api'

// Incorrecto
import apiClient from '@/lib/api'
```

## ✅ Checklist de Verificación

- [ ] Backend corriendo en http://localhost:8000
- [ ] Frontend corriendo en http://localhost:5173
- [ ] .env configurado con VITE_API_URL
- [ ] MongoDB activo
- [ ] Puede acceder a http://localhost:8000/docs (Swagger)
- [ ] GET /conferences/ retorna array (vacío o con datos)
- [ ] Puede registrar usuario (OTP aparece en terminal backend)
- [ ] Puede verificar OTP con código de terminal
- [ ] Puede hacer login
- [ ] Token se guarda en localStorage
- [ ] GET /auth/me retorna usuario

## 📚 Recursos Adicionales

- [README Backend](./back-end/README.md) - Setup backend
- [README Frontend](./front-end/README.md) - Setup frontend
- [API Documentation](http://localhost:8000/docs) - Swagger UI
- [TypeScript API Client](./front-end/src/lib/api.ts) - Tipos y métodos

## 🎯 Próximos Pasos

1. **Activar Auth en Frontend**:
   - Modificar AuthContext para usar apiClient

2. **Completar Pages**:
   - StudentPortal: listar/agregar conferencias
   - SuperAdminDashboard: CRUD completo
   - Agenda: inscripciones a sesiones

3. **Testing**:
   - Tests unitarios de componentes
   - Tests de integración API

4. **Despliegue**:
   - Build para producción
   - Configurar variables de entorno real

---

**¿Problemas?** Revisar los READMEs del backend y frontend para más detalles.
