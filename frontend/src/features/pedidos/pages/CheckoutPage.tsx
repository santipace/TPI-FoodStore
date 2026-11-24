import { Navigate, useNavigate } from 'react-router-dom'
import { formatearPrecio } from '../../../shared/lib/format'
import { Card } from '../../../shared/ui/Card'
import { useCartStore } from '../../../store/cartStore'
import { CheckoutForm } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/useCrearPedido'

export function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()

  if (items.length === 0 && !crearPedido.isSuccess) {
    return <Navigate to="/carrito" replace />
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Confirmar pedido</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="p-6">
          <CheckoutForm
            onConfirmar={async (datos) => {
              await crearPedido.mutateAsync({
                ...datos,
                items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
              })
              vaciar() // el pedido se creo completo: se vacia el carrito
              navigate('/mis-pedidos', { replace: true })
            }}
          />
        </Card>

        <Card className="h-fit p-5">
          <h2 className="text-xl font-bold">Tu pedido</h2>
          <ul className="mt-3 divide-y divide-line">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between gap-3 py-2">
                <span>
                  {i.cantidad} × {i.nombre}
                </span>
                <span className="font-semibold">{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
            <span className="text-ink/70">Total</span>
            <span className="font-display text-2xl font-bold">{formatearPrecio(total)}</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
