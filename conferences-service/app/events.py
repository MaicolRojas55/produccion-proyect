import json
from typing import Any

import aio_pika

from .config import settings


async def publish_event(event_type: str, payload: dict[str, Any]) -> None:
    try:
        connection = await aio_pika.connect_robust(settings.rabbitmq_url)
        async with connection:
            channel = await connection.channel(publisher_confirms=False)
            exchange = await channel.declare_exchange(
                settings.events_exchange, aio_pika.ExchangeType.TOPIC, durable=True
            )
            body = json.dumps({"type": event_type, "payload": payload}).encode("utf-8")
            message = aio_pika.Message(
                body=body, delivery_mode=aio_pika.DeliveryMode.PERSISTENT
            )
            await exchange.publish(message, routing_key=event_type)
    except Exception:
        return

