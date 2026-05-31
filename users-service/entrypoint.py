"""Arranque del contenedor: espera MongoDB, seed opcional y uvicorn."""

from __future__ import annotations

import asyncio
import os
import subprocess
import sys
import time


async def wait_for_mongo(max_attempts: int = 30, delay_sec: float = 2.0) -> None:
    from motor.motor_asyncio import AsyncIOMotorClient

    uri = os.environ.get("MONGODB_URI", "mongodb://users-mongo:27017")
    print("Esperando MongoDB (users-mongo)...")
    for attempt in range(1, max_attempts + 1):
        try:
            client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=2000)
            await client.admin.command("ping")
            client.close()
            print("MongoDB listo.")
            return
        except Exception:
            if attempt == max_attempts:
                print("AVISO: MongoDB no respondió a tiempo.")
                return
            time.sleep(delay_sec)


def run_seed() -> None:
    if os.environ.get("SEED_DEFAULT_USERS", "true").lower() not in ("1", "true", "yes"):
        return
    print("Ejecutando seed de usuarios de prueba...")
    result = subprocess.run([sys.executable, "init_db.py"], check=False)
    if result.returncode != 0:
        print("AVISO: seed de usuarios falló (el servicio seguirá arrancando).")


def main() -> None:
    asyncio.run(wait_for_mongo())
    run_seed()
    os.execvp(
        "uvicorn",
        ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
    )


if __name__ == "__main__":
    main()
