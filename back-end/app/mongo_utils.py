"""Helpers for BSON / Motor documents vs Pydantic and JSON."""

from typing import Any

from bson import ObjectId
from bson.errors import InvalidId
from pydantic import BaseModel, model_validator


def as_object_id(value: str | ObjectId) -> str | ObjectId:
    """Use for Mongo queries on _id when the path param is a 24-char hex string."""
    if isinstance(value, ObjectId):
        return value
    if isinstance(value, str):
        try:
            return ObjectId(value)
        except InvalidId:
            pass
    return value


def normalize_mongo_list_ids(values: list[Any]) -> list[Any]:
    return [as_object_id(v) if isinstance(v, (str, ObjectId)) else v for v in values]


def normalize_mongo_value(value: Any) -> Any:
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, dict):
        return {k: normalize_mongo_value(v) for k, v in value.items()}
    if isinstance(value, list):
        return [normalize_mongo_value(item) for item in value]
    return value


class MongoBaseModel(BaseModel):
    """Coerce ObjectId and nested ObjectIds so Mongo documents validate and JSON-serialize."""

    @model_validator(mode="before")
    @classmethod
    def _normalize_object_ids(cls, data: Any) -> Any:
        return normalize_mongo_value(data)
