import { Link, useNavigate } from 'react-router-dom'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { formatearPrecio } from '../../../shared/lib/format'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { useCartStore } from '../../../store/cartStore'

export function CarritoPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)
  const vaciar = useCartStore((s) => s.vaciar)

  if (items.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold">Tu carrito</h1>
        <EstadoVacio
          titulo="Todavía no agregaste nada"
          descripcion="Elegí algo del catálogo y aparece acá."
          accion={
            <Link to="/" className="font-semibold text-brand-700 underline">
              Ir al catálogo
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Tu carrito</h1>
        <Button variante="texto" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="divide-y divide-line">
          {items.map((item) => (
            <div key={item.producto_id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-40 flex-1">
                <p className="font-bold">{item.nombre}</p>
                <p className="text-sm text-ink/60">{formatearPrecio(item.precio_unitario)} c/u</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variante="secundario"
                  tamano="sm"
                  aria-label={`Quitar una unidad de ${item.nombre}`}
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                >
                  −
                </Button>
                <span className="w-8 text-center font-semibold" aria-live="polite">
                  {item.cantidad}
                </span>
                <Button
                  variante="secundario"
                  tamano="sm"
                  aria-label={`Agregar una unidad de ${item.nombre}`}
                  disabled={item.cantidad >= item.stock}
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                >
                  +
                </Button>
              </div>
              <p className="w-28 text-right font-bold">{formatearPrecio(item.precio_unitario * item.cantidad)}</p>
              <Button variante="texto" tamano="sm" className="text-chile hover:bg-chile-50" onClick={() => quitar(item.producto_id)}>
                Quitar
              </Button>
            </div>
          ))}
        </Card>

        <Card className="h-fit p-5">
          <h2 className="text-xl font-bold">Resumen</h2>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-ink/70">Total</span>
            <span className="font-display text-3xl font-bold">{formatearPrecio(total)}</span>
          </div>
          <Button className="mt-5 w-full" onClick={() => navigate('/checkout')}>
            Continuar al pedido
          </Button>
          <Link to="/" className="mt-3 block text-center font-semibold text-brand-700 underline">
            Seguir comprando
          </Link>
        </Card>
      </div>
    </div>
  )
}
