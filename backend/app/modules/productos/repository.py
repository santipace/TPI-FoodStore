from typing import Optional, Sequence

from sqlalchemy import func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> tuple[int, Sequence[Producto]]:
        """Productos activos filtrados y paginados. Devuelve (total sin paginar, pagina)."""
        stmt = select(Producto).where(Producto.activo == True)  # noqa: E712
        if search:
            stmt = stmt.where(col(Producto.nombre).ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            stmt = stmt.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            stmt = stmt.where(Producto.disponible == disponible)
        total = self.session.exec(select(func.count()).select_from(stmt.subquery())).one()
        items = self.session.exec(stmt.order_by(col(Producto.id)).offset(skip).limit(limit)).all()
        return total, items
