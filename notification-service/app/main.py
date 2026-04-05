import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Configurar logger para el servicio de notificaciones
logger = logging.getLogger(__name__)

# Inicializar aplicación FastAPI del servicio de notificaciones
app = FastAPI(
    title="Servicio de Notificaciones",
    version="0.1.0",
    description="Microservicio dedicado para gestionar notificaciones por email"
)

# Configuración CORS abierta (el gateway valida autenticación)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Gateway maneja restricciones de origen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint de verificación del estado del servicio
@app.get("/health")
async def verificar_salud():
    """Verifica que el servicio de notificaciones esté activo"""
    return {"estado": "saludable", "servicio": "servicio-notificaciones", "version": "0.1.0"}


# Endpoint raíz del servicio
@app.get("/")
async def raiz():
    """Punto de entrada del servicio de notificaciones"""
    return {"mensaje": "Servicio de Notificaciones v0.1.0 - Listo", "función": "Gestión centralizada de emails"}
