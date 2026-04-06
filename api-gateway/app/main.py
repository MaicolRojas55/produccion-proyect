import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .middleware import MiddlewareAuditoriaGateway, MiddlewareRateLimit
from .routes import enrutador_gateway

# Configurar logger para el gateway
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Inicializar aplicación FastAPI del Gateway
app = FastAPI(
    title="API Gateway",
    version="0.2.0",
    description="Gateway centralizado para enrutamiento de microservicios"
)

# Configuración CORS para permitir solicitudes desde el frontend
origenes_permitidos = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
]

# Agregar middleware CORS para permitir solicitudes desde múltiples orígenes
app.add_middleware(
    CORSMiddleware,
    allow_origins=origenes_permitidos,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(MiddlewareAuditoriaGateway)
app.add_middleware(MiddlewareRateLimit)

# Endpoint de verificación del estado del gateway
@app.get("/health")
async def verificar_estado():
    """Verifica que el gateway esté activo y listo para enrutar solicitudes."""
    return {"estado": "saludable", "servicio": "api-gateway", "version": "0.2.0"}


# Endpoint raíz del gateway
@app.get("/")
async def raiz():
    """Punto de entrada del API Gateway."""
    return {
        "mensaje": "API Gateway v0.2.0 - Listo",
        "funcion": "Enrutamiento centralizado y validacion de acceso",
    }


# Registrar rutas proxy bajo /api para no afectar el contrato actual del frontend.
app.include_router(enrutador_gateway)