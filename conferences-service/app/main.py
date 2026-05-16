from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .agenda_seed import ensure_agenda_conferences
from .routes_conferences import router as conferences_router
from .routes_student_agenda import router as student_agenda_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await ensure_agenda_conferences()
    yield


app = FastAPI(title="Conferences Service", version="1.0.0", lifespan=lifespan)


_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(conferences_router)
app.include_router(student_agenda_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "conferences-service"}

