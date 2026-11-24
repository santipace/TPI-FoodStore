from datetime import datetime
from typing import Optional

from app.core.database import utcnow
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario

PENDIENTE = "PENDIENTE"
EN_PREPARACION = "EN_PREPARACION"
ENTREGADO = "ENTREGADO"
CANCELADO = "CANCELADO"

# RN-02: mapa de transiciones validas. Los estados terminales no admiten cambios.
TRANSICIONES: dict[str, set[str]] = {
    PENDIENTE: {EN_PREPARACION, CANCELADO},
    EN_PREPARACION: {ENTREGADO, CANCELADO},
    ENTREGADO: set(),
    CANCELADO: set(),
}


# ---- Excepciones de dominio (el Router las traduce a codigos HTTP) ----
class PedidoNoEncontrado(Exception):
    """404"""


class ProductoNoEncontrado(Exception):
    """404"""


class PedidoAjeno(Exception):
    """403: el pedido pertenece a otro usuario."""


class StockInsuficiente(Exception):
    """400"""


class ProductoNoDisponible(Exception):
    """400"""


class ProductoRepetido(Exception):
    """400"""


class TransicionInvalida(Exception):
    """400"""


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ---------------- RN-01: crear pedido ----------------
    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(set(ids)) != len(ids):
                raise ProductoRepetido("No se puede repetir un producto en el mismo pedido")

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado=PENDIENTE,
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0.0,
                )
            )
            assert pedido.id is not None

            total = 0.0
            for item in data.items:
                # En la misma iteracion: validar, descontar stock y crear la linea.
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"El producto {item.producto_id} no existe o no está activo")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"'{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}': "
                        f"quedan {producto.stock} y pediste {item.cantidad}"
                    )
                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                assert producto.id is not None
                uow.detalles.add(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,  # copia del nombre
                        precio_unitario=producto.precio_base,  # copia del precio
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)  # RN-05: total fijo desde la creacion
            uow.pedidos.refresh(pedido)  # recarga las lineas para armar la respuesta
            return PedidoRead.model_validate(pedido)

    # ---------------- Consultas ----------------
    def listar(self, usuario: Usuario, estado: Optional[str], skip: int, limit: int) -> PedidosPaginados:
        """RN-04: el cliente ve solo sus pedidos; el admin ve todos."""
        with self.uow as uow:
            if usuario.role == "admin":
                total, items = uow.pedidos.list_all(estado, skip, limit)
            else:
                assert usuario.id is not None
                total, items = uow.pedidos.list_by_usuario(usuario.id, estado, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in items])

    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get_pedido(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("Este pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    # ---------------- RN-02 y RN-03: cambio de estado (admin) ----------------
    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get_pedido(uow, pedido_id)
            self._aplicar_transicion(uow, pedido, nuevo_estado)
            return PedidoRead.model_validate(pedido)

    # ---------------- RN-03 y RN-04: cancelar pedido propio ----------------
    def cancelar_propio(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get_pedido(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("Este pedido pertenece a otro usuario")
            if pedido.estado != PENDIENTE:
                raise TransicionInvalida("Solo se pueden cancelar los pedidos en estado PENDIENTE")
            self._aplicar_transicion(uow, pedido, CANCELADO)
            return PedidoRead.model_validate(pedido)

    # ---------------- Resumen del panel (admin) ----------------
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            hoy: datetime = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado(PENDIENTE),
                en_preparacion=uow.pedidos.count_by_estado(EN_PREPARACION),
                entregados=uow.pedidos.count_by_estado(ENTREGADO),
                cancelados=uow.pedidos.count_by_estado(CANCELADO),
                pedidos_hoy=uow.pedidos.count_desde(hoy),
                ingresos_entregados=round(uow.pedidos.sum_total_por_estado(ENTREGADO), 2),
            )

    # ---------------- Helpers internos ----------------
    @staticmethod
    def _get_pedido(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    @staticmethod
    def _aplicar_transicion(uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str) -> None:
        # RN-02: se valida ANTES de modificar el pedido.
        if nuevo_estado not in TRANSICIONES.get(pedido.estado, set()):
            raise TransicionInvalida(f"No se puede pasar de {pedido.estado} a {nuevo_estado}")
        if nuevo_estado == CANCELADO:
            # RN-03: restituir el stock de cada linea en la misma transaccion.
            for linea in pedido.items:
                producto = uow.productos.get_by_id(linea.producto_id)
                if producto is not None:
                    producto.stock += linea.cantidad
        pedido.estado = nuevo_estado
        pedido.updated_at = utcnow()
