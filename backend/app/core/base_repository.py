from typing import Generic, Optional, Sequence, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Operaciones basicas de acceso a datos. No contiene reglas de negocio ni hace commit."""

    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, id: int) -> Optional[T]:
        return self.session.get(self.model, id)

    def get_all(self) -> Sequence[T]:
        return self.session.exec(select(self.model)).all()

    def add(self, entity: T) -> T:
        self.session.add(entity)
        self.session.flush()  # asigna el id sin confirmar la transaccion
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()

    def refresh(self, entity: T) -> T:
        self.session.flush()  # primero se vuelcan los cambios pendientes para que el refresh no los pise
        self.session.refresh(entity)
        return entity
