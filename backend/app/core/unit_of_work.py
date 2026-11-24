from typing import Callable, Optional

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    """Unit of Work base.

    __enter__ abre la sesion y crea los repositorios; __exit__ hace commit si el bloque
    termino bien, rollback si hubo una excepcion y siempre cierra la sesion. Es el unico
    lugar donde se confirma la transaccion: ningun Service ni Router llama a commit().
    """

    def __init__(self, session_factory: Callable[[], Session] = default_session_factory) -> None:
        self._session_factory = session_factory
        self.session: Optional[Session] = None

    def __enter__(self) -> "UnitOfWork":
        self.session = self._session_factory()
        self._create_repositories(self.session)
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> bool:
        assert self.session is not None
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
        return False  # no traga la excepcion: sigue hacia el Router

    def _create_repositories(self, session: Session) -> None:
        """Las subclases crean aca los repositorios que comparten la misma sesion."""
