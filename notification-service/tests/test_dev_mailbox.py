from pathlib import Path

import pytest

from app.dev_mailbox import (
    get_latest_dev_mail,
    init_dev_mailbox_db,
    save_dev_mail,
)


@pytest.fixture(autouse=True)
async def fresh_mailbox_db():
    import os

    db_path = Path(os.environ["SQLITE_PATH"])
    if db_path.exists():
        db_path.unlink()
    await init_dev_mailbox_db()
    yield
    if db_path.exists():
        db_path.unlink()


@pytest.mark.asyncio
async def test_save_and_retrieve_latest_otp():
    await save_dev_mail(
        "user@example.com",
        "123456",
        "Tu codigo OTP",
        expires_at="2099-01-01T00:00:00",
    )
    entry = await get_latest_dev_mail("user@example.com")
    assert entry is not None
    assert entry["otp_code"] == "123456"
    assert entry["email"] == "user@example.com"


@pytest.mark.asyncio
async def test_latest_returns_most_recent_code():
    await save_dev_mail("a@b.com", "111111", "OTP 1")
    await save_dev_mail("a@b.com", "222222", "OTP 2")
    entry = await get_latest_dev_mail("a@b.com")
    assert entry["otp_code"] == "222222"
