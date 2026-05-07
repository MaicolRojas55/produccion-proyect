from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes_auth import router as auth_router
from .routes_users import router as users_router


app = FastAPI(title="Users Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    # Servicios internos: solo el gateway Nginx accede directamente.
    # Si se añade frontend adicional, agrega su origen aquí.
    allow_origins=[
        "http://gateway",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth_router)
app.include_router(users_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "users-service"}

