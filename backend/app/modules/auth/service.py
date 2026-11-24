from fastapi import HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    """Registro y login. Usa el modelo Usuario; en este modulo se permite lanzar HTTPException."""

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        email = data.email.lower()
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username) or uow.usuarios.get_by_email(email):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El username o el email ya están registrados",
                )
            usuario = Usuario(
                username=data.username,
                full_name=data.full_name,
                email=email,
                hashed_password=hash_password(data.password),
                role="user",  # el registro publico siempre crea usuarios con rol user
            )
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def login(self, username: str, password: str) -> str:
        """Valida las credenciales y devuelve el JWT (el Router lo guarda en la cookie)."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Usuario o contraseña incorrectos",
                )
            if usuario.disabled:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
            return create_access_token(usuario.username)
