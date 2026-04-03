from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings


client = AsyncIOMotorClient(settings.mongodb_uri)
db = client[settings.mongodb_db]

# Colecciones existentes
users_collection = db["users"]
otps_collection = db["otps"]

# Nuevas colecciones
sessions_collection = db["sessions"]
speakers_collection = db["speakers"]
calendar_events_collection = db["calendar_events"]
conferences_collection = db["conferences"]
student_agenda_collection = db["student_agenda"]
agenda_inscriptions_collection = db["agenda_inscriptions"]
attendance_collection = db["attendance"]
