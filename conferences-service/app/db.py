from motor.motor_asyncio import AsyncIOMotorClient

from .config import settings


client = AsyncIOMotorClient(settings.mongodb_uri)
db = client[settings.mongodb_db]

conferences_collection = db["conferences"]
student_agenda_collection = db["student_agenda"]

