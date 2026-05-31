import os

os.environ.setdefault("MONGODB_URI", "mongodb://127.0.0.1:27017")
os.environ.setdefault("MONGODB_DB", "conferences_test_db")
os.environ.setdefault(
    "JWT_SECRET_KEY",
    "test-jwt-secret-key-minimum-32-characters-for-ci",
)
