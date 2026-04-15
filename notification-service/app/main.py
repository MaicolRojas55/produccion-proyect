import logging
import asyncio
import json
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Servicio encargado del envío de correos
from .email import servicio_notificaciones

# Modelos de entrada y salida para el endpoint
from .models import RespuestaNotificacion, SolicitudNotificacion

# Configuración general (RabbitMQ, colas, etc.)
from .config import configuracion

# Funciones de base de datos para eventos
from .events_db import init_db, insert_event, count_events

import aio_pika  # Cliente async para RabbitMQ


# -----------------------------
# Configuración del logger
# -----------------------------
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


# --------------------------------------------------
# Consumidor asíncrono de eventos desde RabbitMQ
# --------------------------------------------------
async def _consume_events_forever() -> None:
    """
    Se conecta a RabbitMQ y consume eventos continuamente.
    Si la conexión falla, intenta reconectar automáticamente.
    """
    while True:
        try:
            # Conexión robusta (reintenta automáticamente)
            connection = await aio_pika.connect_robust(configuracion.rabbitmq_url)

            async with connection:
                channel = await connection.channel()

                # Declaración del exchange tipo TOPIC
                exchange = await channel.declare_exchange(
                    configuracion.events_exchange,
                    aio_pika.ExchangeType.TOPIC,
                    durable=True,
                )

                # Declaración de la cola donde se recibirán los eventos
                queue = await channel.declare_queue(
                    configuracion.events_queue,
                    durable=True,
                )

                # Enlaces de la cola a distintos tipos de eventos
                await queue.bind(exchange, routing_key="user.*")
                await queue.bind(exchange, routing_key="conference.*")

                # Iterador asíncrono de mensajes
                async with queue.iterator() as queue_iter:
                    async for message in queue_iter:

                        # Procesamiento seguro del mensaje
                        async with message.process(requeue=True):

                            # Decodificación del mensaje
                            raw = message.body.decode("utf-8", errors="replace")

                            # Intento de parsear JSON
                            try:
                                obj = json.loads(raw)
                            except Exception:
                                # Manejo de mensajes inválidos
                                obj = {"type": "unknown", "payload": {"raw": raw}}

                            # Extracción de datos del evento
                            event_type = str(obj.get("type") or "unknown")
                            payload = obj.get("payload") or {}

                            # Serialización del payload
                            payload_json = json.dumps(payload, ensure_ascii=False)

                            # Guardado del evento en la base de datos
                            await insert_event(
                                event_type=event_type,
                                payload_json=payload_json,
                                processed_at=datetime.utcnow().isoformat(),
                            )

                            logger.info("evento_consumido tipo=%s", event_type)

        except Exception as e:
            # Si falla la conexión, se reintenta después de 2 segundos
            logger.warning("consumer_reconnect motivo=%s", str(e))
            await asyncio.sleep(2)


# --------------------------------------------------
# Manejo del ciclo de vida de la aplicación
# --------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Controla el inicio y apagado de la aplicación:
    - Inicializa la base de datos
    - Lanza el consumidor de eventos en segundo plano
    - Cancela la tarea al cerrar la app
    """
    # Inicializar base de datos
    await init_db()

    # Crear tarea en segundo plano
    task = asyncio.create_task(_consume_events_forever())

    yield  # Aquí la aplicación queda corriendo

    # Cancelación controlada al apagar la app
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


# --------------------------------------------------
# Inicialización de FastAPI
# --------------------------------------------------
app = FastAPI(
    title="Servicio de Notificaciones",
    version="0.2.0",
    description="Microservicio dedicado para gestionar notificaciones por email",
    lifespan=lifespan,  # Uso del ciclo de vida moderno
)


# --------------------------------------------------
# Configuración de CORS
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Se permite cualquier origen (controlado por gateway)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Endpoints del servicio
# --------------------------------------------------

@app.get("/health")
async def verificar_salud():
    """
    Endpoint de verificación de estado del servicio.
    Útil para monitoreo (health checks).
    """
    return {
        "estado": "saludable",
        "servicio": "servicio-notificaciones",
        "version": "0.2.0"
    }


@app.get("/")
async def raiz():
    """
    Endpoint raíz informativo.
    """
    return {"mensaje": "Servicio de Notificaciones v0.2.0 - Listo"}


@app.get("/metrics")
async def metrics():
    """
    Retorna métricas básicas del servicio.
    En este caso, el número de eventos procesados.
    """
    total = await count_events()
    return {"processed_events_total": total}


@app.post("/notify", response_model=RespuestaNotificacion)
async def notificar(solicitud: SolicitudNotificacion) -> RespuestaNotificacion:
    """
    Endpoint principal para enviar notificaciones por email.
    
    Recibe una solicitud, delega el envío al servicio de email
    y retorna el resultado del proceso.
    """
    resultado = await servicio_notificaciones.enviar_notificacion(solicitud)

    logger.info(
        "notificacion_procesada tipo=%s destinatario=%s enviada=%s",
        solicitud.tipo,
        solicitud.email_destino,
        resultado.enviada,
    )

    return resultado
