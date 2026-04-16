import aiosqlite

from .config import configuracion


CREATE_SQL = """
CREATE TABLE IF NOT EXISTS processed_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  processed_at TEXT NOT NULL
);
"""


async def init_db() -> None:
    async with aiosqlite.connect(configuracion.sqlite_path) as db:
        await db.execute(CREATE_SQL)
        await db.commit()


async def insert_event(event_type: str, payload_json: str, processed_at: str) -> None:
    async with aiosqlite.connect(configuracion.sqlite_path) as db:
        await db.execute(
            "INSERT INTO processed_events (event_type, payload_json, processed_at) VALUES (?, ?, ?)",
            (event_type, payload_json, processed_at),
        )
        await db.commit()


async def count_events() -> int:
    async with aiosqlite.connect(configuracion.sqlite_path) as db:
        cur = await db.execute("SELECT COUNT(*) FROM processed_events")
        row = await cur.fetchone()
        return int(row[0] if row else 0)

