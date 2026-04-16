from motor.motor_asyncio import AsyncIOMotorClient

from .config import settings


client = AsyncIOMotorClient(settings.mongodb_uri)
db = client[settings.mongodb_db]

users_collection = db["users"]
otps_collection = db["otps"]

