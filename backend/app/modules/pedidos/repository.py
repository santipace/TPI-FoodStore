from datetime import datetime
from typing import Optional, Sequence

from sqlalchemy import func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def _paginar(
        self, usuario_id: Optional[int], estado: Optional[str], skip: int, limit: int
    ) -> tuple[int, Sequence[Pedido]]:
        stmt = select(Pedido)
        if usuario_id is not None:
            stmt = stmt.where(Pedido.usuario_id == usuario_id)
        if estado is not None:
            stmt = stmt.where(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(stmt.subquery())).one()
        items = self.session.exec(
            stmt.order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc()).offset(skip).limit(limit)
        ).all()
        return total, items

    def list_by_usuario(
        self, usuario_id: int, estado: Optional[str], skip: int, limit: int
    ) -> tuple[int, Sequence[Pedido]]:
        return self._paginar(usuario_id, estado, skip, limit)

    def list_all(self, estado: Optional[str], skip: int, limit: int) -> tuple[int, Sequence[Pedido]]:
        return self._paginar(None, estado, skip, limit)

    def count_by_estado(self, estado: str) -> int:
        return self.session.exec(select(func.count()).select_from(Pedido).where(Pedido.estado == estado)).one()

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)).one()

    def sum_total_por_estado(self, estado: str) -> float:
        suma = self.session.exec(select(func.sum(Pedido.total)).where(Pedido.estado == estado)).one()
        return float(suma or 0.0)


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, DetallePedido)
