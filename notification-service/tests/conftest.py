import os
from pathlib import Path

os.environ.setdefault(
    "SQLITE_PATH",
    str(Path(__file__).resolve().parent / "test_mailbox.sqlite"),
)
os.environ.setdefault("NOTIFICATION_MODE", "simulado")
os.environ.setdefault("DEV_MAILBOX_ENABLED", "true")
