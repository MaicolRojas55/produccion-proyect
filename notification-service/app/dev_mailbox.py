"""Bandeja de correo simulada para desarrollo (OTP visible sin revisar logs)."""

from datetime import datetime

import aiosqlite

from .config import configuracion

CREATE_SQL = """
CREATE TABLE IF NOT EXISTS dev_mailbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  subject TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_dev_mailbox_email_created
  ON dev_mailbox (email, created_at DESC);
"""


async def init_dev_mailbox_db() -> None:
    async with aiosqlite.connect(configuracion.sqlite_path) as db:
        await db.executescript(CREATE_SQL)
        await db.commit()


async def save_dev_mail(
    email: str,
    otp_code: str,
    subject: str,
    *,
    expires_at: str | None = None,
) -> None:
    created_at = datetime.utcnow().isoformat()
    async with aiosqlite.connect(configuracion.sqlite_path) as db:
        await db.execute(
            """
            INSERT INTO dev_mailbox (email, otp_code, subject, created_at, expires_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (email.lower().strip(), otp_code, subject, created_at, expires_at),
        )
        await db.commit()


async def get_latest_dev_mail(email: str) -> dict | None:
    normalized = email.lower().strip()
    async with aiosqlite.connect(configuracion.sqlite_path) as db:
        db.row_factory = aiosqlite.Row
        cur = await db.execute(
            """
            SELECT email, otp_code, subject, created_at, expires_at
            FROM dev_mailbox
            WHERE email = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (normalized,),
        )
        row = await cur.fetchone()
        if not row:
            return None
        return dict(row)


async def list_recent_dev_mail(limit: int = 20) -> list[dict]:
    safe_limit = max(1, min(limit, 50))
    async with aiosqlite.connect(configuracion.sqlite_path) as db:
        db.row_factory = aiosqlite.Row
        cur = await db.execute(
            """
            SELECT email, otp_code, subject, created_at, expires_at
            FROM dev_mailbox
            ORDER BY id DESC
            LIMIT ?
            """,
            (safe_limit,),
        )
        rows = await cur.fetchall()
        return [dict(r) for r in rows]
