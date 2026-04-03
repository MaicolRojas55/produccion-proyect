# Producción Proyect - Frontend

Este proyecto contiene el frontend (interfaz de usuario) del sistema, desarrollado con **React**, **Vite**, **TypeScript** y **Tailwind CSS**. Además, utiliza herramientas y bibliotecas modernas para ofrecer una experiencia rápida, robusta y escalable.

## 🚀 Tecnologías Principales

- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos y UI:** [Tailwind CSS](https://tailwindcss.com/) y componentes de [shadcn/ui](https://ui.shadcn.com/) (basado en Radix UI).
- **Rutas:** [React Router v6](https://reactrouter.com/)
- **Fetch de Datos:** [TanStack React Query](https://tanstack.com/query/latest)
- **Formularios:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Testing:** [Vitest](https://vitest.dev/) y React Testing Library

## 📦 Estructura del Proyecto

Aunque la estructura puede ir creciendo, a grandes rasgos encontrarás:

```text
produccion-proyect/
├── public/              # Archivos estáticos públicos (favicon, etc.)
├── src/
│   ├── components/      # Componentes reutilizables (ej. componentes UI de shadcn)
│   ├── lib/             # Utilidades genéricas (ej. utils.ts para tailwind-merge)
│   ├── pages/           # Vistas y Páginas correspondientes a las rutas (opcional)
│   ├── hooks/           # Custom hooks de React
│   ├── App.tsx          # Componente principal de la aplicación
│   ├── main.tsx         # Punto de entrada de la aplicación
│   └── index.css        # Estilos globales y capas de Tailwind
├── package.json         # Dependencias y scripts
├── tailwind.config.ts   # Configuración de Tailwind CSS
├── vite.config.ts       # Configuración de Vite
└── vitest.config.ts     # Configuración para pruebas
```

## 🛠️ Instalación y Configuración

Sigue estos pasos para levantar el entorno de desarrollo local:

1. **Clonar/Navegar al repositorio/carpeta:**
   Asegúrate de estar en el directorio raíz del proyecto (`produccion-proyect`).

2. **Instalar dependencias:**
   Es recomendable usar `npm` (o `bun`, ya que existe un archivo `bun.lockb` en la raíz).
   ```bash
   npm install
   # o si usas bun:
   bun install
   ```

3. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   # o bien:
   bun run dev
   ```

   El servidor iniciará, usualmente en la dirección [http://localhost:5173](http://localhost:5173). La recarga en caliente (HMR) está habilitada por defecto.

## 📜 Scripts Disponibles

En el directorio del proyecto puedes ejecutar los siguientes comandos:

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo local usando Vite. |
| `npm run build` | Construye la aplicación optimizada para producción (en la carpeta `dist`). |
| `npm run preview` | Levanta un servidor para previsualizar la compilación local de producción. |
| `npm run lint` | Analiza el código buscando errores de sintaxis y formato con ESLint. |
| `npm run test` | Ejecuta las pruebas unitarias usando Vitest. |
| `npm run test:watch` | Ejecuta las pruebas en modo observador o watch. |

## 🌐 Conexión con el Backend

Este frontend está diseñado para consumir la API de backend (habitualmente desarrollada en FastAPI/Python para este proyecto). 
Asegúrate de que el backend esté corriendo y sea accesible para que características como la autenticación o la carga de datos funcionen correctamente.

> **Nota para configuración de entornos:** Puedes configurar y centralizar la URL base de tu API usando variables de entorno (`.env`), por ejemplo:
> `VITE_API_BASE_URL="http://localhost:8000"`

---
**Desarrollado y mantenido para el sistema de Producción y Gestión.**
