from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.core.database import utcnow

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


class Pedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: str = Field(default="PENDIENTE", index=True)
    forma_pago: str  # EFECTIVO | TRANSFERENCIA
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: Optional[str] = Field(default=None)
    total: float = Field(default=0.0)  # = suma de los subtotales; fijo desde la creacion
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)

    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)
    cantidad: int = Field(ge=1)
    nombre_producto: str  # copia del nombre al momento de la compra
    precio_unitario: float  # copia del precio al momento de la compra
    subtotal: float  # precio_unitario x cantidad

    pedido: Optional[Pedido] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship(back_populates="detalles")
