import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { formatearPrecio } from '../../../shared/lib/format'
import { ResumenCard } from '../components/ResumenCard'
import { useResumenPedidos } from '../hooks/useResumenPedidos'

export function AdminResumenPage() {
  const { data, isLoading, isError, error, refetch } = useResumenPedidos()

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Resumen del negocio</h1>
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : (
        data && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ResumenCard titulo="Pedidos pendientes" valor={data.pendientes} />
            <ResumenCard titulo="En preparación" valor={data.en_preparacion} />
            <ResumenCard titulo="Entregados" valor={data.entregados} />
            <ResumenCard titulo="Cancelados" valor={data.cancelados} />
            <ResumenCard titulo="Pedidos de hoy" valor={data.pedidos_hoy} />
            <ResumenCard titulo="Ingresos por entregados" valor={formatearPrecio(data.ingresos_entregados)} />
          </div>
        )
      )}
    </div>
  )
}
