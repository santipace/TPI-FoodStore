from typing import Optional

from sqlmodel import Field, SQLModel


class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=500)


class CategoriaUpdate(SQLModel):
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=500)


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    activo: bool
