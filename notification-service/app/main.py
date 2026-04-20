import logging
import asyncio
import json
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .email import servicio_notificaciones
from .models import RespuestaNotificacion, SolicitudNotificacion
from .config import configuracion
from .events_db import init_db, insert_event, count_events

import aio_pika

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


async def _consume_events_forever() -> None:
    while True:
        try:
            connection = await aio_pika.connect_robust(configuracion.rabbitmq_url)
            async with connection:
                channel = await connection.channel()
                exchange = await channel.declare_exchange(
                    configuracion.events_exchange,
                    aio_pika.ExchangeType.TOPIC,
                    durable=True,
                )
                queue = await channel.declare_queue(
                    configuracion.events_queue,
                    durable=True,
                )
                await queue.bind(exchange, routing_key="user.*")
                await queue.bind(exchange, routing_key="conference.*")

                async with queue.iterator() as queue_iter:
                    async for message in queue_iter:
                        async with message.process(requeue=True):
                            raw = message.body.decode("utf-8", errors="replace")
                            try:
                                obj = json.loads(raw)
                            except Exception:
                                obj = {"type": "unknown", "payload": {"raw": raw}}

                            event_type = str(obj.get("type") or "unknown")
                            payload = obj.get("payload") or {}
                            payload_json = json.dumps(payload, ensure_ascii=False)

                            await insert_event(
                                event_type=event_type,
                                payload_json=payload_json,
                                processed_at=datetime.utcnow().isoformat(),
                            )
                            logger.info("evento_consumido tipo=%s", event_type)
        except Exception as e:
            logger.warning("consumer_reconnect motivo=%s", str(e))
            await asyncio.sleep(2)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    task = asyncio.create_task(_consume_events_forever())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="Servicio de Notificaciones",
    version="0.2.0",
    description="Microservicio dedicado para gestionar notificaciones por email",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def verificar_salud():
    return {"estado": "saludable", "servicio": "servicio-notificaciones", "version": "0.2.0"}


@app.get("/")
async def raiz():
    return {"mensaje": "Servicio de Notificaciones v0.2.0 - Listo"}


@app.get("/metrics")
async def metrics():
    total = await count_events()
    return {"processed_events_total": total}


@app.post("/notify", response_model=RespuestaNotificacion)
async def notificar(solicitud: SolicitudNotificacion) -> RespuestaNotificacion:
    resultado = await servicio_notificaciones.enviar_notificacion(solicitud)
    logger.info(
        "notificacion_procesada tipo=%s destinatario=%s enviada=%s",
        solicitud.tipo,
        solicitud.email_destino,
        resultado.enviada,
    )
    return resultado
