from datetime import timedelta

from app.auth import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from app.routes_auth import generate_otp_code
from jose import jwt

from app.config import settings


def test_generate_otp_code_length_and_digits():
    code = generate_otp_code(6)
    assert len(code) == 6
    assert code.isdigit()


def test_password_hash_and_verify():
    hashed = get_password_hash("MiClaveSegura123!")
    assert hashed != "MiClaveSegura123!"
    assert verify_password("MiClaveSegura123!", hashed)
    assert not verify_password("otra-clave", hashed)


def test_jwt_create_and_decode():
    token = create_access_token(
        {"sub": "user@test.com", "user_id": "abc", "role": "usuario_registrado"},
        expires_delta=timedelta(minutes=5),
    )
    payload = jwt.decode(
        token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
    )
    assert payload["sub"] == "user@test.com"
    assert payload["role"] == "usuario_registrado"
