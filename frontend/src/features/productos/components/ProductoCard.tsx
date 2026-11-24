import { formatearPrecio } from '../../../shared/lib/format'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { useCartStore } from '../../../store/cartStore'
import type { Producto } from '../types/producto'
import { ProductoImagen } from './ProductoImagen'

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)

  const sinStock = producto.stock <= 0
  const noVendible = !producto.disponible || sinStock
  const alLimite = enCarrito >= producto.stock

  return (
    <Card className="flex flex-col overflow-hidden">
      <ProductoImagen nombre={producto.nombre} imagenUrl={producto.imagen_url} className="h-40 w-full" />
      <div className="flex flex-1 flex-col p-4">
        {producto.categoria && <p className="text-sm font-semibold text-brand-700">{producto.categoria.nombre}</p>}
        <h3 className="mt-0.5 text-lg font-bold leading-snug">{producto.nombre}</h3>
        {producto.descripcion && <p className="mt-1 text-sm text-ink/70">{producto.descripcion}</p>}

        <div className="mt-auto pt-4">
          <p className="text-xl font-bold">{formatearPrecio(producto.precio_base)}</p>
          <p className="mb-3 text-sm text-ink/60">
            {noVendible ? 'Sin stock por ahora' : `Quedan ${producto.stock}`}
            {enCarrito > 0 && ` · En tu carrito: ${enCarrito}`}
          </p>
          <Button
            className="w-full"
            disabled={noVendible || alLimite}
            onClick={() =>
              agregar({
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                stock: producto.stock,
              })
            }
          >
            {noVendible ? 'No disponible' : alLimite ? 'Máximo en el carrito' : 'Agregar al carrito'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
