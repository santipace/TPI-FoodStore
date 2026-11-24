from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    productos: ProductoRepository
    categorias: CategoriaRepository

    def _create_repositories(self, session: Session) -> None:
        self.productos = ProductoRepository(session)
        self.categorias = CategoriaRepository(session)
