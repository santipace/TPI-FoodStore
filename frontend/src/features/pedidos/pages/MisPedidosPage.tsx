import { useState } from 'react'
import { Link } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { formatearFecha, formatearPrecio } from '../../../shared/lib/format'
import { Alerta } from '../../../shared/ui/Alerta'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { ConfirmModal } from '../../../shared/ui/ConfirmModal'
import { PedidoDetalleModal } from '../components/PedidoDetalleModal'
import { useCancelarPedido } from '../hooks/useCancelarPedido'
import { usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types/pedido'

const PEDIDOS_POR_PAGINA = 5

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)
  const [errorCancelar, setErrorCancelar] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: pagina * PEDIDOS_POR_PAGINA,
    limit: PEDIDOS_POR_PAGINA,
  })
  const cancelar = useCancelarPedido()
  const totalPaginas = data ? Math.ceil(data.total / PEDIDOS_POR_PAGINA) : 0

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Mis pedidos</h1>
      {aviso && (
        <div className="mb-4">
          <Alerta tipo="exito">{aviso}</Alerta>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : data && data.items.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hiciste ningún pedido"
          accion={
            <Link to="/" className="font-semibold text-brand-700 underline">
              Ir al catálogo
            </Link>
          }
        />
      ) : (
        data && (
          <>
            <div className="space-y-3">
              {data.items.map((pedido) => (
                <Card key={pedido.id} className="flex flex-wrap items-center gap-4 p-4">
                  <div className="min-w-44 flex-1">
                    <p className="font-bold">Pedido #{pedido.id}</p>
                    <p className="text-sm text-ink/60">{formatearFecha(pedido.created_at)}</p>
                  </div>
                  <BadgeEstado estado={pedido.estado} />
                  <p className="w-28 text-right font-bold">{formatearPrecio(pedido.total)}</p>
                  <div className="flex gap-1">
                    <Button variante="secundario" tamano="sm" onClick={() => setDetalleId(pedido.id)}>
                      Ver detalle
                    </Button>
                    {pedido.estado === 'PENDIENTE' && (
                      <Button
                        variante="peligro"
                        tamano="sm"
                        onClick={() => {
                          setErrorCancelar(null)
                          setACancelar(pedido)
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
          </>
        )
      )}

      <PedidoDetalleModal pedidoId={detalleId} onCerrar={() => setDetalleId(null)} />

      <ConfirmModal
        abierto={aCancelar !== null}
        titulo={`Cancelar pedido #${aCancelar?.id ?? ''}`}
        mensaje="¿Seguro que querés cancelar este pedido? Los productos vuelven al stock y no se puede deshacer."
        textoConfirmar="Cancelar pedido"
        cargando={cancelar.isPending}
        error={errorCancelar}
        onCerrar={() => setACancelar(null)}
        onConfirmar={() => {
          if (!aCancelar) return
          const pedido = aCancelar
          cancelar.mutate(pedido.id, {
            onSuccess: () => {
              setAviso(`Pedido #${pedido.id} cancelado`)
              setACancelar(null)
            },
            onError: (e) => setErrorCancelar(handleApiError(e, 'No se pudo cancelar el pedido')),
          })
        }}
      />
    </div>
  )
}
