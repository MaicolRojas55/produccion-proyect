import asyncio
from datetime import datetime

from app.auth import get_password_hash
from app.db import (
    users_collection,
    sessions_collection,
    speakers_collection,
    conferences_collection
)

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

DEFAULT_SESSIONS = [
    {
        "date": "2025-10-01",
        "time": "08:30",
        "end_time": "09:30",
        "title": "Ceremonia de Inauguración",
        "speaker": "Comité Organizador CONIITI",
        "speaker_role": "Universidad Católica de Colombia",
        "location": "Auditorio Principal",
        "type": "keynote",
        "description": "Apertura oficial del XI Congreso Internacional de Innovación y Tendencias en Ingeniería.",
        "url": "https://meet.example.com/inauguracion",
    },
    {
        "date": "2025-10-01",
        "time": "09:30",
        "end_time": "10:30",
        "title": "Inteligencia Artificial y el Futuro de la Ingeniería",
        "speaker": "Ph.D. Julio Emilio Torres",
        "speaker_role": "Consultor / CSIC — España",
        "location": "Auditorio Principal",
        "type": "keynote",
        "track": "IA & Innovación",
        "description": "Conferencia magistral sobre el impacto de la IA en los procesos de ingeniería y las tendencias emergentes.",
    },
    {
        "date": "2025-10-01",
        "time": "11:00",
        "end_time": "12:00",
        "title": "Transformación Digital en la Industria Latinoamericana",
        "speaker": "Dr. Rubén Fuentes Fernández",
        "speaker_role": "Investigador / GRASIA — España",
        "location": "Auditorio Principal",
        "type": "conference",
        "track": "Transformación Digital",
        "capacity": 100,
    },
]

DEFAULT_SPEAKERS = [
    {
        "name": "Ph.D. Julio Emilio Torres",
        "role": "Consultor / CSIC — España",
        "bio": "Experto en inteligencia artificial con más de 15 años de experiencia en investigación y desarrollo de soluciones tecnológicas.",
        "track": "IA & Innovación",
        "linkedin": "https://linkedin.com/in/julio-torres",
        "website": "https://julio-torres.ai",
    },
    {
        "name": "Dr. Rubén Fuentes Fernández",
        "role": "Investigador / GRASIA — España",
        "bio": "Investigador especializado en transformación digital y su impacto en la industria latinoamericana.",
        "track": "Transformación Digital",
        "linkedin": "https://linkedin.com/in/ruben-fuentes",
    },
    {
        "name": "Arq. Francisco Pardo Campo",
        "role": "Director / PROES LATAM — España",
        "bio": "Arquitecto y urbanista con especialización en ciudades inteligentes y desarrollo sostenible.",
        "track": "Ciudades Inteligentes",
        "linkedin": "https://linkedin.com/in/francisco-pardo",
    },
]

DEFAULT_CONFERENCES = [
    {
        "title": "Taller de Machine Learning Aplicado",
        "location": "Laboratorio de Innovación",
        "start_at": "2025-10-02T14:30:00Z",
        "end_at": "2025-10-02T16:30:00Z",
        "description": "Taller práctico sobre aplicaciones de machine learning en ingeniería.",
        "capacity": 25,
    },
    {
        "title": "Panel: Innovación en Energías Renovables",
        "location": "Sala de Conferencias B",
        "start_at": "2025-10-03T10:00:00Z",
        "end_at": "2025-10-03T12:00:00Z",
        "description": "Discusión sobre las últimas tendencias en energías renovables y su aplicación en Latinoamérica.",
        "capacity": 50,
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


async def initialize_database() -> None:
    print("🚀 Iniciando inicialización completa de la base de datos...")

    # Initialize users
    print("\n👥 Inicializando usuarios por defecto...")
    await users_collection.create_index("email", unique=True)

    for user_data in DEFAULT_USERS:
        existing = await users_collection.find_one({"email": user_data["email"]})
        if existing:
            print(f"  ✓ Usuario existente: {user_data['email']}")
            continue

        user_doc = build_user_document(user_data)
        await users_collection.insert_one(user_doc)
        print(f"  ➕ Usuario creado: {user_data['email']}")

    # Seed sessions
    print("\n📅 Poblando sesiones de agenda...")
    for session_data in DEFAULT_SESSIONS:
        existing = await sessions_collection.find_one({
            "date": session_data["date"],
            "title": session_data["title"]
        })
        if existing:
            print(f"  ✓ Sesión existente: {session_data['title']}")
            continue

        session_dict = session_data.copy()
        await sessions_collection.insert_one(session_dict)
        print(f"  ➕ Sesión creada: {session_data['title']}")

    # Seed speakers
    print("\n🎤 Poblando conferencistas...")
    for speaker_data in DEFAULT_SPEAKERS:
        existing = await speakers_collection.find_one({"name": speaker_data["name"]})
        if existing:
            print(f"  ✓ Conferencista existente: {speaker_data['name']}")
            continue

        speaker_dict = speaker_data.copy()
        await speakers_collection.insert_one(speaker_dict)
        print(f"  ➕ Conferencista creado: {speaker_data['name']}")

    # Seed conferences (attach a creator id when a super_admin exists)
    print("\n🎪 Poblando conferencias adicionales...")
    super_admin_doc = await users_collection.find_one({"role": "super_admin"})
    creator_id = str(super_admin_doc["_id"]) if super_admin_doc else None

    for conference_data in DEFAULT_CONFERENCES:
        existing = await conferences_collection.find_one({
            "title": conference_data["title"],
            "start_at": conference_data["start_at"]
        })
        if existing:
            print(f"  ✓ Conferencia existente: {conference_data['title']}")
            continue

        conference_dict = conference_data.copy()
        if creator_id:
            conference_dict["created_by_user_id"] = creator_id
        await conferences_collection.insert_one(conference_dict)
        print(f"  ➕ Conferencia creada: {conference_data['title']}")

    # Backfill created_by_user_id on legacy conference docs (optional field was missing)
    if creator_id:
        await conferences_collection.update_many(
            {"created_by_user_id": {"$exists": False}},
            {"$set": {"created_by_user_id": creator_id}},
        )

    print("\n✅ Inicialización de la base de datos completada exitosamente!")
    print("\n📋 Resumen:")
    print("   • Usuarios por defecto creados")
    print("   • Sesiones de agenda pobladas")
    print("   • Conferencistas registrados")
    print("   • Conferencias adicionales disponibles")
    print("\n🎯 El backend está listo para usar!")


if __name__ == "__main__":
    asyncio.run(initialize_database())
