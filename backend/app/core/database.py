from datetime import datetime, timezone

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

_connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args)


def utcnow() -> datetime:
    """Fecha y hora actual en UTC, sin zona horaria (naive), para los campos datetime."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def session_factory() -> Session:
    """Crea una sesion nueva. expire_on_commit=False deja usar los objetos despues del commit."""
    return Session(engine, expire_on_commit=False)


def create_all_tables() -> None:
    # Importar todos los modelos para que SQLModel conozca las cinco tablas y sus relaciones.
    from app.modules.categorias import models as _categorias  # noqa: F401
    from app.modules.pedidos import models as _pedidos  # noqa: F401
    from app.modules.productos import models as _productos  # noqa: F401
    from app.modules.usuarios import models as _usuarios  # noqa: F401

    SQLModel.metadata.create_all(engine)
