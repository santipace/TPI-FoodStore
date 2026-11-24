from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router

API_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(_app: FastAPI):
    create_all_tables()  # crea las tablas si no existen
    yield


app = FastAPI(
    title="Food Store API",
    description="API REST del sistema de pedidos de comida. TPI de Programación 4 (UTN).",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS con credenciales: el navegador envia la cookie HttpOnly desde el frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(usuarios_router, prefix=API_PREFIX)
app.include_router(categorias_router, prefix=API_PREFIX)
app.include_router(productos_router, prefix=API_PREFIX)
app.include_router(pedidos_router, prefix=API_PREFIX)


@app.get("/", include_in_schema=False)
def raiz() -> dict[str, str]:
    return {"message": "Food Store API", "docs": "/docs"}
