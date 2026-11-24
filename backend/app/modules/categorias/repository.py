from typing import Optional, Sequence

from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        """Busca entre todas, tambien las dadas de baja: la baja logica no libera el nombre."""
        return self.session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()

    def list_activas(self) -> Sequence[Categoria]:
        return self.session.exec(
            select(Categoria).where(Categoria.activo == True).order_by(Categoria.nombre)  # noqa: E712
        ).all()
