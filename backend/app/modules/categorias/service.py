from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    """La categoria no existe o esta dada de baja (404)."""


class NombreDuplicado(Exception):
    """Ya existe una categoria con ese nombre (409)."""


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._get_activa(uow, categoria_id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre) is not None:
                raise NombreDuplicado(f"Ya existe una categoría llamada '{data.nombre}'")
            categoria = uow.categorias.add(Categoria(nombre=data.nombre, descripcion=data.descripcion))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._get_activa(uow, categoria_id)
            cambios = data.model_dump(exclude_unset=True)  # actualizacion parcial
            nuevo_nombre = cambios.get("nombre")
            if nuevo_nombre is not None and nuevo_nombre != categoria.nombre:
                if uow.categorias.get_by_nombre(nuevo_nombre) is not None:
                    raise NombreDuplicado(f"Ya existe una categoría llamada '{nuevo_nombre}'")
            for campo, valor in cambios.items():
                if campo == "nombre" and valor is None:
                    continue  # el nombre es obligatorio: un null no lo borra
                setattr(categoria, campo, valor)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = self._get_activa(uow, categoria_id)
            categoria.activo = False  # baja logica

    @staticmethod
    def _get_activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("Categoría no encontrada")
        return categoria
