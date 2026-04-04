from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..auth import get_current_active_user, get_current_admin_user
from ..db import calendar_events_collection
from ..models import CalendarEvent, User
from ..mongo_utils import as_object_id

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("/", response_model=List[CalendarEvent])
async def get_calendar_events(current_user: User = Depends(get_current_active_user)):
    """Obtener eventos del calendario según el rol del usuario"""
    query = {}

    # Filtrar por audiencia según el rol
    if current_user.role == "usuario_registrado":
        query["audience"] = {"$in": ["todos", "registrados"]}
    elif current_user.role in ["super_admin", "web_master"]:
        # Staff puede ver todos los eventos
        pass
    else:
        query["audience"] = "todos"

    cursor = calendar_events_collection.find(query)
    events = []
    async for event in cursor:
        events.append(CalendarEvent(**event))
    return sorted(events, key=lambda x: (x.date, x.start_time))


@router.get("/{event_id}", response_model=CalendarEvent)
async def get_calendar_event(event_id: str, current_user: User = Depends(get_current_active_user)):
    """Obtener un evento específico"""
    event_doc = await calendar_events_collection.find_one({"_id": as_object_id(event_id)})
    if not event_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evento no encontrado")

    event = CalendarEvent(**event_doc)

    # Verificar permisos de visualización
    if current_user.role == "usuario_registrado" and event.audience == "staff":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para ver este evento")

    return event


@router.post("/", response_model=CalendarEvent)
async def create_calendar_event(event: CalendarEvent, current_user: User = Depends(get_current_active_user)):
    """Crear un nuevo evento del calendario"""
    # Solo staff puede crear eventos
    if current_user.role not in ["super_admin", "web_master"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo el staff puede crear eventos")

    event_dict = event.dict(exclude_unset=True)
    event_dict.pop("_id", None)
    event_dict["created_by_user_id"] = current_user.id
    event_dict["created_by_role"] = current_user.role

    result = await calendar_events_collection.insert_one(event_dict)
    event_dict["_id"] = result.inserted_id

    return CalendarEvent(**event_dict)


@router.put("/{event_id}", response_model=CalendarEvent)
async def update_calendar_event(event_id: str, event: CalendarEvent, current_user: User = Depends(get_current_active_user)):
    """Actualizar un evento del calendario"""
    # Verificar que el usuario creó el evento o es admin
    existing_event = await calendar_events_collection.find_one({"_id": as_object_id(event_id)})
    if not existing_event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evento no encontrado")

    if existing_event["created_by_user_id"] != current_user.id and current_user.role not in ["super_admin", "web_master"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para editar este evento")

    event_dict = event.dict(exclude_unset=True)
    event_dict.pop("_id", None)

    result = await calendar_events_collection.update_one(
        {"_id": as_object_id(event_id)},
        {"$set": event_dict}
    )

    return CalendarEvent(**{**event_dict, "_id": event_id})


@router.delete("/{event_id}")
async def delete_calendar_event(event_id: str, current_user: User = Depends(get_current_active_user)):
    """Eliminar un evento del calendario"""
    # Verificar que el usuario creó el evento o es admin
    existing_event = await calendar_events_collection.find_one({"_id": as_object_id(event_id)})
    if not existing_event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evento no encontrado")

    if existing_event["created_by_user_id"] != current_user.id and current_user.role not in ["super_admin", "web_master"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para eliminar este evento")

    result = await calendar_events_collection.delete_one({"_id": as_object_id(event_id)})
    return {"message": "Evento eliminado"}


@router.post("/{event_id}/attend")
async def attend_event(event_id: str, current_user: User = Depends(get_current_active_user)):
    """Marcar asistencia a un evento"""
    event_doc = await calendar_events_collection.find_one({"_id": as_object_id(event_id)})
    if not event_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evento no encontrado")

    event = CalendarEvent(**event_doc)

    # Verificar permisos de asistencia
    if current_user.role == "usuario_registrado" and event.audience == "staff":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para asistir a este evento")

    # Agregar usuario a la lista de asistentes si no está ya
    if current_user.id not in event.attendees:
        await calendar_events_collection.update_one(
            {"_id": as_object_id(event_id)},
            {"$push": {"attendees": current_user.id}}
        )

    return {"message": "Asistencia registrada"}


@router.delete("/{event_id}/attend")
async def unattend_event(event_id: str, current_user: User = Depends(get_current_active_user)):
    """Cancelar asistencia a un evento"""
    await calendar_events_collection.update_one(
        {"_id": as_object_id(event_id)},
        {"$pull": {"attendees": current_user.id}}
    )

    return {"message": "Asistencia cancelada"}