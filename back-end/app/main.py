from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import auth, users, sessions, speakers, calendar, conferences, student_agenda, agenda_inscriptions, attendance, stats

app = FastAPI(title="Producción Conference API", version="0.1.0")

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(sessions.router)
app.include_router(speakers.router)
app.include_router(calendar.router)
app.include_router(conferences.router)
app.include_router(student_agenda.router)
app.include_router(agenda_inscriptions.router)
app.include_router(attendance.router)
app.include_router(stats.router)


@app.get("/")
async def root():
    return {"message": "API de backend lista"}
