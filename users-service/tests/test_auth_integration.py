from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "users-service"


@pytest.mark.asyncio
async def test_register_rejects_duplicate_email():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        with patch("app.routes_auth.users_collection") as users_mock:
            users_mock.find_one = AsyncMock(
                return_value={"email": "dup@test.com"}
            )
            response = await client.post(
                "/auth/register",
                json={
                    "full_name": "Test User",
                    "email": "dup@test.com",
                    "password": "Password123!",
                    "role": "usuario_registrado",
                },
            )
    assert response.status_code == 400
    assert "registrado" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_register_creates_user_and_publishes_event():
    insert_user = MagicMock(inserted_id="user123")
    insert_otp = MagicMock(inserted_id="otp456")

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        with (
            patch("app.routes_auth.users_collection") as users_mock,
            patch("app.routes_auth.otps_collection") as otps_mock,
            patch("app.routes_auth.publish_event", new_callable=AsyncMock) as publish_mock,
        ):
            users_mock.find_one = AsyncMock(return_value=None)
            users_mock.insert_one = AsyncMock(return_value=insert_user)
            otps_mock.insert_one = AsyncMock(return_value=insert_otp)
            publish_mock.return_value = None

            response = await client.post(
                "/auth/register",
                json={
                    "full_name": "Nuevo Usuario",
                    "email": "nuevo@test.com",
                    "password": "Password123!",
                    "role": "usuario_registrado",
                },
            )

    assert response.status_code == 200
    body = response.json()
    assert "otp_id" in body
    publish_mock.assert_awaited_once()
    assert publish_mock.await_args.args[0] == "user.registered"


@pytest.mark.asyncio
async def test_verify_otp_rejects_invalid_code():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        with patch("app.routes_auth.otps_collection") as otps_mock:
            otps_mock.find_one = AsyncMock(return_value=None)
            response = await client.post(
                "/auth/verify-otp",
                params={"email": "nuevo@test.com", "code": "000000"},
            )
    assert response.status_code == 400
