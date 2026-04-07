from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from .config import settings
from .models import TokenClaims


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


async def get_token_claims(
    token: Annotated[str, Depends(oauth2_scheme)]
) -> TokenClaims:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
        return TokenClaims(
            sub=payload.get("sub"),
            user_id=payload.get("user_id"),
            role=payload.get("role"),
        )
    except JWTError:
        raise credentials_exception


async def require_staff(claims: Annotated[TokenClaims, Depends(get_token_claims)]) -> TokenClaims:
    if claims.role not in ("super_admin", "web_master"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Solo staff"
        )
    return claims

