from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True, unique=True, min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None)
    activo: bool = Field(default=True)  # baja logica

    productos: list["Producto"] = Relationship(back_populates="categoria")
