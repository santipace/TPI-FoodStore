export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO'
export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA'

export const ESTADOS: EstadoPedido[] = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO']

export interface DetallePedido {
  producto_id: number
  nombre_producto: string
  precio_unitario: number
  cantidad: number
  subtotal: number
}

export interface Pedido {
  id: number
  usuario_id: number
  estado: EstadoPedido
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
  total: number
  created_at: string
  updated_at: string
  items: DetallePedido[]
}

export interface PedidosPaginados {
  total: number
  items: Pedido[]
}

export interface FiltrosPedidos {
  skip?: number
  limit?: number
  estado?: EstadoPedido
}

export interface PedidoCreatePayload {
  items: { producto_id: number; cantidad: number }[]
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
}

export interface ResumenPedidos {
  pendientes: number
  en_preparacion: number
  entregados: number
  cancelados: number
  pedidos_hoy: number
  ingresos_entregados: number
}

/** Espejo de la maquina de estados del backend: a que estado avanza cada uno. */
export const SIGUIENTE_ESTADO: Record<EstadoPedido, EstadoPedido | null> = {
  PENDIENTE: 'EN_PREPARACION',
  EN_PREPARACION: 'ENTREGADO',
  ENTREGADO: null,
  CANCELADO: null,
}

export const ETIQUETA_ESTADO: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

export function puedeCancelarse(estado: EstadoPedido): boolean {
  return estado === 'PENDIENTE' || estado === 'EN_PREPARACION'
}
