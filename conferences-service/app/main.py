from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes_conferences import router as conferences_router
from .routes_student_agenda import router as student_agenda_router


app = FastAPI(title="Conferences Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    # Servicios internos: solo el gateway Nginx accede directamente.
    allow_origins=[
        "http://gateway",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(conferences_router)
app.include_router(student_agenda_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "conferences-service"}

