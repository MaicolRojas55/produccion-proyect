from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes_auth import router as auth_router
from .routes_users import router as users_router


app = FastAPI(title="Users Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "users-service"}

