"""
Usuarios de prueba para users_db (auth del gateway /api/auth).

Idempotente: no duplica si el email ya existe.
Ejecutar: python init_db.py (desde users-service/)
Docker: se ejecuta al arrancar el contenedor si SEED_DEFAULT_USERS=true
"""

import asyncio
from datetime import datetime

from app.auth import get_password_hash
from app.db import users_collection

DEFAULT_USERS = [
    {
        "full_name": "Super Admin",
        "email": "super_admin@example.com",
        "password": "SuperAdmin123!",
        "role": "super_admin",
    },
    {
        "full_name": "Web Master",
        "email": "web_master@example.com",
        "password": "WebMaster123!",
        "role": "web_master",
    },
    {
        "full_name": "Usuario Registrado",
        "email": "user@example.com",
        "password": "Usuario123!",
        "role": "usuario_registrado",
    },
]


def build_user_document(user_data: dict) -> dict:
    return {
        "full_name": user_data["full_name"],
        "email": user_data["email"],
        "hashed_password": get_password_hash(user_data["password"]),
        "role": user_data["role"],
        "is_active": True,
        "is_verified": True,
        "created_at": datetime.utcnow(),
    }


async def initialize_users() -> None:
    print("Inicializando usuarios de prueba en users_db...")
    await users_collection.create_index("email", unique=True)

    created = 0
    skipped = 0
    for user_data in DEFAULT_USERS:
        existing = await users_collection.find_one({"email": user_data["email"]})
        if existing:
            print(f"  Ya existe: {user_data['email']} ({user_data['role']})")
            skipped += 1
            continue

        await users_collection.insert_one(build_user_document(user_data))
        print(f"  Creado: {user_data['email']} ({user_data['role']})")
        created += 1

    print(f"Listo. Creados: {created}, omitidos: {skipped}.")


if __name__ == "__main__":
    asyncio.run(initialize_users())
