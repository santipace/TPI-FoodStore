from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id", index=True)
    nombre: str
    descripcion: Optional[str] = Field(default=None)
    precio_base: float = Field(ge=0)
    imagen_url: Optional[str] = Field(default=None)
    stock: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)  # baja logica

    categoria: Optional["Categoria"] = Relationship(back_populates="productos")
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")
