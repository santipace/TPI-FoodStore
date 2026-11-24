from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository


class CategoriaUnitOfWork(UnitOfWork):
    categorias: CategoriaRepository

    def _create_repositories(self, session: Session) -> None:
        self.categorias = CategoriaRepository(session)
