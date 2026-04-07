from bson import ObjectId


def as_object_id(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except Exception:
        return ObjectId()

