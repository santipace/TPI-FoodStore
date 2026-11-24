from typing import Optional

from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead


class ProductoCreate(SQLModel):
    categoria_id: int
    nombre: str = Field(min_length=1, max_length=150)
    descripcion: Optional[str] = Field(default=None, max_length=500)
    precio_base: float = Field(ge=0)
    imagen_url: Optional[str] = Field(default=None, max_length=500)
    stock: int = Field(default=0, ge=0)
    disponible: bool = True


class ProductoUpdate(SQLModel):
    categoria_id: Optional[int] = None
    nombre: Optional[str] = Field(default=None, min_length=1, max_length=150)
    descripcion: Optional[str] = Field(default=None, max_length=500)
    precio_base: Optional[float] = Field(default=None, ge=0)
    imagen_url: Optional[str] = Field(default=None, max_length=500)
    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = None


class ProductoStockUpdate(SQLModel):
    stock: int = Field(ge=0)
    disponible: bool


class ProductoRead(SQLModel):
    id: int
    categoria_id: int
    nombre: str
    descripcion: Optional[str] = None
    precio_base: float
    imagen_url: Optional[str] = None
    stock: int
    disponible: bool
    activo: bool
    categoria: Optional[CategoriaRead] = None


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
