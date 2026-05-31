import os

import pytest

os.environ.setdefault(
    "JWT_SECRET_KEY",
    "test-jwt-secret-key-minimum-32-characters-required",
)
os.environ.setdefault("MONGODB_URI", "mongodb://localhost:27017")
os.environ.setdefault("MONGODB_DB", "users_test_db")
os.environ.setdefault("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")


@pytest.fixture
def anyio_backend():
    return "asyncio"
