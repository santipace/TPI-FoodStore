import { handleApiError } from '../../../shared/api/handleApiError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { formatearFecha, formatearPrecio } from '../../../shared/lib/format'
import { Alerta } from '../../../shared/ui/Alerta'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Modal } from '../../../shared/ui/Modal'
import { usePedido } from '../hooks/usePedidos'

interface PedidoDetalleModalProps {
  pedidoId: number | null
  onCerrar: () => void
}

/** Detalle de un pedido con sus lineas (GET /pedidos/{id}). */
export function PedidoDetalleModal({ pedidoId, onCerrar }: PedidoDetalleModalProps) {
  const { data: pedido, isLoading, isError, error } = usePedido(pedidoId)

  return (
    <Modal abierto={pedidoId !== null} titulo={`Pedido #${pedidoId ?? ''}`} onCerrar={onCerrar}>
      {isLoading && <Skeleton className="h-40" />}
      {isError && <Alerta tipo="error">{handleApiError(error)}</Alerta>}
      {pedido && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <BadgeEstado estado={pedido.estado} />
            <span className="text-sm text-ink/60">{formatearFecha(pedido.created_at)}</span>
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="font-semibold">Dirección</dt>
            <dd>{pedido.direccion_entrega}</dd>
            <dt className="font-semibold">Forma de pago</dt>
            <dd>{pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</dd>
            {pedido.notas && (
              <>
                <dt className="font-semibold">Notas</dt>
                <dd>{pedido.notas}</dd>
              </>
            )}
          </dl>

          <table className="w-full text-left text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className="py-2 font-semibold">Producto</th>
                <th className="py-2 text-right font-semibold">Cant.</th>
                <th className="py-2 text-right font-semibold">Precio</th>
                <th className="py-2 text-right font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pedido.items.map((linea) => (
                <tr key={linea.producto_id} className="border-b border-line">
                  <td className="py-2">{linea.nombre_producto}</td>
                  <td className="py-2 text-right">{linea.cantidad}</td>
                  <td className="py-2 text-right">{formatearPrecio(linea.precio_unitario)}</td>
                  <td className="py-2 text-right">{formatearPrecio(linea.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="py-2 text-right font-bold">
                  Total
                </td>
                <td className="py-2 text-right text-base font-bold">{formatearPrecio(pedido.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Modal>
  )
}
