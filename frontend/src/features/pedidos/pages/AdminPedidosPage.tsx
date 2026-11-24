import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Alerta } from '../../../shared/ui/Alerta'
import { ConfirmModal } from '../../../shared/ui/ConfirmModal'
import { Select } from '../../../shared/ui/Input'
import { PedidoDetalleModal } from '../components/PedidoDetalleModal'
import { PedidosTable } from '../components/PedidosTable'
import { useCambiarEstadoPedido } from '../hooks/useCambiarEstadoPedido'
import { usePedidos } from '../hooks/usePedidos'
import { ESTADOS, ETIQUETA_ESTADO, type EstadoPedido, type Pedido } from '../types/pedido'

const PEDIDOS_POR_PAGINA = 10

export function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const [pagina, setPagina] = useState(0)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null)

  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: pagina * PEDIDOS_POR_PAGINA,
    limit: PEDIDOS_POR_PAGINA,
    estado: estado || undefined,
  })
  const cambiarEstado = useCambiarEstadoPedido()
  const totalPaginas = data ? Math.ceil(data.total / PEDIDOS_POR_PAGINA) : 0
  const procesandoId = cambiarEstado.isPending ? (cambiarEstado.variables?.id ?? null) : null

  function aplicarEstado(pedido: Pedido, nuevoEstado: EstadoPedido, alTerminar?: () => void) {
    cambiarEstado.mutate(
      { id: pedido.id, estado: nuevoEstado },
      {
        onSuccess: () => {
          const extra = nuevoEstado === 'CANCELADO' ? ' y se restituyó el stock' : ''
          setMensaje({ tipo: 'exito', texto: `Pedido #${pedido.id}: ${ETIQUETA_ESTADO[nuevoEstado]}${extra}` })
          alTerminar?.()
        },
        onError: (e) => {
          setMensaje({ tipo: 'error', texto: handleApiError(e, 'No se pudo cambiar el estado') })
          alTerminar?.()
        },
      },
    )
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <Select
          label="Filtrar por estado"
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value as EstadoPedido | '')
            setPagina(0)
          }}
        >
          <option value="">Todos</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {ETIQUETA_ESTADO[e]}
            </option>
          ))}
        </Select>
      </div>
      {mensaje && (
        <div className="mb-4">
          <Alerta tipo={mensaje.tipo}>{mensaje.texto}</Alerta>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : data && data.items.length === 0 ? (
        <EstadoVacio titulo="No hay pedidos para mostrar" descripcion={estado ? 'Probá con otro estado.' : undefined} />
      ) : (
        data && (
          <>
            <PedidosTable
              pedidos={data.items}
              procesandoId={procesandoId}
              onVerDetalle={(p) => setDetalleId(p.id)}
              onAvanzar={(p, nuevo) => aplicarEstado(p, nuevo)}
              onCancelar={setACancelar}
            />
            <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
          </>
        )
      )}

      <PedidoDetalleModal pedidoId={detalleId} onCerrar={() => setDetalleId(null)} />

      <ConfirmModal
        abierto={aCancelar !== null}
        titulo={`Cancelar pedido #${aCancelar?.id ?? ''}`}
        mensaje="Al cancelar, el stock de cada producto del pedido se restituye. No se puede deshacer."
        textoConfirmar="Cancelar pedido"
        cargando={cambiarEstado.isPending}
        onCerrar={() => setACancelar(null)}
        onConfirmar={() => {
          if (aCancelar) aplicarEstado(aCancelar, 'CANCELADO', () => setACancelar(null))
        }}
      />
    </div>
  )
}
