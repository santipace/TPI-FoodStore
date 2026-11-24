from typing import Callable

from fastapi import Depends, HTTPException, Request, status
from sqlmodel import select

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario

COOKIE_NAME = "access_token"


def get_current_user(request: Request) -> Usuario:
    """Lee el JWT de la cookie HttpOnly, valida firma y vencimiento y carga el usuario."""
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado: iniciá sesión para continuar",
    )
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise credentials_error
    username = decode_access_token(token)
    if username is None:
        raise credentials_error
    with session_factory() as session:
        usuario = session.exec(select(Usuario).where(Usuario.username == username)).first()
    if usuario is None:
        raise credentials_error
    return usuario


def get_current_active_user(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    """Rechaza con 400 a los usuarios dados de baja (disabled)."""
    if usuario.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
    return usuario


def require_role(roles: list[str]) -> Callable[[Usuario], Usuario]:
    """Dependencia que exige que el rol del usuario este entre los permitidos (403 si no)."""

    def checker(usuario: Usuario = Depends(get_current_active_user)) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta acción",
            )
        return usuario

    return checker
