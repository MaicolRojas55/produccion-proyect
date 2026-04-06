import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .email import servicio_notificaciones
from .models import RespuestaNotificacion, SolicitudNotificacion

# Configurar logger para el servicio de notificaciones
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Inicializar aplicación FastAPI del servicio de notificaciones
app = FastAPI(
    title="Servicio de Notificaciones",
    version="0.2.0",
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
    return {"estado": "saludable", "servicio": "servicio-notificaciones", "version": "0.2.0"}


# Endpoint raíz del servicio
@app.get("/")
async def raiz():
    """Punto de entrada del servicio de notificaciones"""
    return {"mensaje": "Servicio de Notificaciones v0.2.0 - Listo", "funcion": "Gestion centralizada de emails"}


# Endpoint principal para recibir solicitudes de notificacion desde otros servicios.
@app.post("/notify", response_model=RespuestaNotificacion)
async def notificar(solicitud: SolicitudNotificacion) -> RespuestaNotificacion:
    """Procesa una notificacion y devuelve el resultado del envio."""
    resultado = await servicio_notificaciones.enviar_notificacion(solicitud)

    logger.info(
        "notificacion_procesada tipo=%s destinatario=%s enviada=%s",
        solicitud.tipo,
        solicitud.email_destino,
        resultado.enviada,
    )

    return resultado
