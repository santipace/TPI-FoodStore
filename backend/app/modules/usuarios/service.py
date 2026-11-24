from fastapi import HTTPException, status

from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    """Gestion de usuarios para el admin. En este modulo se permite lanzar HTTPException."""

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_ordenados()]

    def activar(self, usuario_id: int) -> UserPublic:
        return self._cambiar_estado(usuario_id, disabled=False, admin_actual_id=None)

    def desactivar(self, usuario_id: int, admin_actual_id: int) -> UserPublic:
        return self._cambiar_estado(usuario_id, disabled=True, admin_actual_id=admin_actual_id)

    def _cambiar_estado(self, usuario_id: int, disabled: bool, admin_actual_id: int | None) -> UserPublic:
        with self.uow as uow:
            usuario: Usuario | None = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
            if disabled and admin_actual_id is not None and usuario.id == admin_actual_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Un administrador no puede desactivarse a sí mismo",
                )
            usuario.disabled = disabled  # idempotente: responde 200 aunque no cambie
            return UserPublic.model_validate(usuario)
