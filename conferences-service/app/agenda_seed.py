"""
Upsert conferencias enlazadas a los Session.id estáticos de la SPA (front-end agenda).

Sin esto, `GET /conferences/` queda vacío y la página Agenda solo guardaba inscripciones en
localStorage, mientras que «Mi espacio» usa el microservicio vía `/student-agenda/`.
"""

from datetime import datetime

from .db import conferences_collection


def _iso(date: str, hhmm: str) -> str:
    return f"{date}T{hhmm}:00"


# Replica de front-end/src/data/agendaData.ts (solo sesiones inscribibles ≠ break).
AGENDA_CONFERENCE_SEED: tuple[dict[str, object], ...] = (
    {
        "agenda_session_id": "d1-2",
        "title": "Ceremonia de Inauguración",
        "description": "Apertura oficial del XI Congreso Internacional de Innovación y Tendencias en Ingeniería.",
        "start_at": _iso("2025-10-01", "08:30"),
        "end_at": _iso("2025-10-01", "09:30"),
        "location": "Auditorio Principal",
    },
    {
        "agenda_session_id": "d1-3",
        "title": "Inteligencia Artificial y el Futuro de la Ingeniería",
        "description": "Conferencia magistral sobre el impacto de la IA en los procesos de ingeniería y las tendencias emergentes.",
        "start_at": _iso("2025-10-01", "09:30"),
        "end_at": _iso("2025-10-01", "10:30"),
        "location": "Auditorio Principal",
    },
    {
        "agenda_session_id": "d1-4",
        "title": "Coffee Break & Networking",
        "start_at": _iso("2025-10-01", "10:30"),
        "end_at": _iso("2025-10-01", "11:00"),
        "location": "Zona de Exposiciones",
    },
    {
        "agenda_session_id": "d1-5",
        "title": "Transformación Digital en la Industria Latinoamericana",
        "start_at": _iso("2025-10-01", "11:00"),
        "end_at": _iso("2025-10-01", "12:00"),
        "location": "Auditorio Principal",
        "capacity": 100,
    },
    {
        "agenda_session_id": "d1-7",
        "title": "Presentación de Artículos — Sesión 1",
        "description": "Presentación paralela de artículos aprobados en múltiples tracks temáticos.",
        "start_at": _iso("2025-10-01", "13:30"),
        "end_at": _iso("2025-10-01", "15:00"),
        "location": "Salas A, B y C",
        "capacity": 60,
    },
    {
        "agenda_session_id": "d1-8",
        "title": "Workshop: Diseño de Soluciones con IoT",
        "start_at": _iso("2025-10-01", "15:00"),
        "end_at": _iso("2025-10-01", "16:30"),
        "location": "Laboratorio de Innovación",
        "capacity": 30,
    },
    {
        "agenda_session_id": "d1-9",
        "title": "Networking & Exposición de Proyectos",
        "start_at": _iso("2025-10-01", "16:30"),
        "end_at": _iso("2025-10-01", "17:30"),
        "location": "Hall de Exposiciones",
    },
    {
        "agenda_session_id": "d2-2",
        "title": "Ingeniería Sostenible y Ciudades Inteligentes",
        "start_at": _iso("2025-10-02", "08:30"),
        "end_at": _iso("2025-10-02", "09:30"),
        "location": "Auditorio Principal",
    },
    {
        "agenda_session_id": "d2-3",
        "title": "Presentación de Artículos — Sesión 2",
        "start_at": _iso("2025-10-02", "09:30"),
        "end_at": _iso("2025-10-02", "11:00"),
        "location": "Salas A, B y C",
        "capacity": 60,
    },
    {
        "agenda_session_id": "d2-5",
        "title": "Workshop: Machine Learning Aplicado",
        "start_at": _iso("2025-10-02", "11:30"),
        "end_at": _iso("2025-10-02", "13:00"),
        "location": "Laboratorio de Innovación",
        "capacity": 25,
    },
    {
        "agenda_session_id": "d2-7",
        "title": "Panel: Innovación y Emprendimiento en Ingeniería",
        "description": "Mesa redonda con emprendedores y académicos sobre las oportunidades de innovación.",
        "start_at": _iso("2025-10-02", "14:30"),
        "end_at": _iso("2025-10-02", "15:30"),
        "location": "Auditorio Principal",
        "capacity": 80,
    },
    {
        "agenda_session_id": "d2-8",
        "title": "Presentación de Artículos — Sesión 3",
        "start_at": _iso("2025-10-02", "15:30"),
        "end_at": _iso("2025-10-02", "17:00"),
        "location": "Salas A, B y C",
        "capacity": 60,
    },
    {
        "agenda_session_id": "d2-9",
        "title": "Cena de Gala & Networking",
        "description": "Evento social para fortalecer redes de contacto entre participantes y conferencistas.",
        "start_at": _iso("2025-10-02", "19:00"),
        "end_at": _iso("2025-10-02", "22:00"),
        "location": "Por confirmar",
    },
    {
        "agenda_session_id": "d3-2",
        "title": "Workshop: Ciberseguridad en Infraestructura Crítica",
        "start_at": _iso("2025-10-03", "08:30"),
        "end_at": _iso("2025-10-03", "10:00"),
        "location": "Laboratorio de Innovación",
        "capacity": 20,
    },
    {
        "agenda_session_id": "d3-3",
        "title": "Presentación de Artículos — Sesión 4",
        "start_at": _iso("2025-10-03", "10:00"),
        "end_at": _iso("2025-10-03", "11:00"),
        "location": "Salas A y B",
        "capacity": 40,
    },
    {
        "agenda_session_id": "d3-5",
        "title": "Conferencia de Cierre: Tendencias 2026 en Ingeniería",
        "start_at": _iso("2025-10-03", "11:30"),
        "end_at": _iso("2025-10-03", "12:30"),
        "location": "Auditorio Principal",
    },
    {
        "agenda_session_id": "d3-6",
        "title": "Ceremonia de Clausura y Premiaciones",
        "description": "Entrega de premios a mejores artículos y reconocimientos especiales. Cierre oficial del XI CONIITI.",
        "start_at": _iso("2025-10-03", "12:30"),
        "end_at": _iso("2025-10-03", "13:30"),
        "location": "Auditorio Principal",
    },
    {
        "agenda_session_id": "d3-7",
        "title": "Almuerzo de Cierre & Despedida",
        "start_at": _iso("2025-10-03", "13:30"),
        "end_at": _iso("2025-10-03", "15:00"),
        "location": "Zona gastronómica",
    },
)


async def ensure_agenda_conferences() -> None:
    """Idempotente: mantiene alineadas las conferencias públicas con la agenda del front."""
    for row in AGENDA_CONFERENCE_SEED:
        sid = str(row["agenda_session_id"])
        set_fields: dict[str, object] = {
            "title": row["title"],
            "start_at": row["start_at"],
            "end_at": row["end_at"],
            "location": row["location"],
            "agenda_session_id": sid,
        }
        if row.get("description"):
            set_fields["description"] = row["description"]
        if row.get("capacity") is not None:
            set_fields["capacity"] = row["capacity"]

        await conferences_collection.update_one(
            {"agenda_session_id": sid},
            {
                "$set": set_fields,
                "$setOnInsert": {"created_at": datetime.utcnow()},
            },
            upsert=True,
        )
