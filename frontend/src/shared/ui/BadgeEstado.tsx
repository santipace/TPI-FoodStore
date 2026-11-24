import { ETIQUETA_ESTADO, type EstadoPedido } from '../../features/pedidos/types/pedido'

const COLORES: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-saffron/25 text-[#7a5200]',
  EN_PREPARACION: 'bg-sky-100 text-sky-900',
  ENTREGADO: 'bg-brand-100 text-brand-800',
  CANCELADO: 'bg-chile-50 text-chile',
}

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-semibold ${COLORES[estado]}`}>
      {ETIQUETA_ESTADO[estado]}
    </span>
  )
}
