import pytest
from httpx import ASGITransport, AsyncClient
from unittest.mock import patch, AsyncMock

from app.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    with patch("app.main.ensure_agenda_conferences", new_callable=AsyncMock):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "conferences-service"
