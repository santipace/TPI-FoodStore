import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo } from 'react'
import { formatearFecha, formatearPrecio } from '../../../shared/lib/format'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { ETIQUETA_ESTADO, puedeCancelarse, SIGUIENTE_ESTADO, type EstadoPedido, type Pedido } from '../types/pedido'

interface PedidosTableProps {
  pedidos: Pedido[]
  onVerDetalle: (pedido: Pedido) => void
  onAvanzar: (pedido: Pedido, nuevoEstado: EstadoPedido) => void
  onCancelar: (pedido: Pedido) => void
  procesandoId: number | null
}

const columna = createColumnHelper<Pedido>()

/** Tabla de pedidos del panel de administracion (la paginacion la maneja el servidor). */
export function PedidosTable({ pedidos, onVerDetalle, onAvanzar, onCancelar, procesandoId }: PedidosTableProps) {
  const columnas = useMemo(
    () => [
      columna.accessor('id', { header: 'Pedido', cell: (info) => <span className="font-semibold">#{info.getValue()}</span> }),
      columna.accessor('created_at', { header: 'Fecha', cell: (info) => formatearFecha(info.getValue()) }),
      columna.accessor('usuario_id', { header: 'Cliente', cell: (info) => `Usuario #${info.getValue()}` }),
      columna.accessor('forma_pago', {
        header: 'Pago',
        cell: (info) => (info.getValue() === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'),
      }),
      columna.accessor('total', { header: 'Total', cell: (info) => formatearPrecio(info.getValue()) }),
      columna.accessor('estado', { header: 'Estado', cell: (info) => <BadgeEstado estado={info.getValue()} /> }),
      columna.display({
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => {
          const pedido = info.row.original
          const siguiente = SIGUIENTE_ESTADO[pedido.estado]
          const ocupado = procesandoId === pedido.id
          return (
            <div className="flex flex-wrap gap-1">
              <Button variante="texto" tamano="sm" onClick={() => onVerDetalle(pedido)}>
                Ver detalle
              </Button>
              {siguiente && (
                <Button tamano="sm" disabled={ocupado} onClick={() => onAvanzar(pedido, siguiente)}>
                  Pasar a «{ETIQUETA_ESTADO[siguiente]}»
                </Button>
              )}
              {puedeCancelarse(pedido.estado) && (
                <Button variante="peligro" tamano="sm" disabled={ocupado} onClick={() => onCancelar(pedido)}>
                  Cancelar
                </Button>
              )}
            </div>
          )
        },
      }),
    ],
    [onVerDetalle, onAvanzar, onCancelar, procesandoId],
  )

  const tabla = useReactTable({ data: pedidos, columns: columnas, getCoreRowModel: getCoreRowModel() })

  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="border-b border-line bg-paper text-sm">
          {tabla.getHeaderGroups().map((grupo) => (
            <tr key={grupo.id}>
              {grupo.headers.map((h) => (
                <th key={h.id} className="px-4 py-3 font-semibold">
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {tabla.getRowModel().rows.map((fila) => (
            <tr key={fila.id} className="border-b border-line last:border-0">
              {fila.getVisibleCells().map((celda) => (
                <td key={celda.id} className="px-4 py-3 align-middle">
                  {flexRender(celda.column.columnDef.cell, celda.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
