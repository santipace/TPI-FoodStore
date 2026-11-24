import { useState } from 'react'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { handleApiError } from '../../../shared/api/handleApiError'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import { Button } from '../../../shared/ui/Button'
import { Input, Select } from '../../../shared/ui/Input'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const PRODUCTOS_POR_PAGINA = 8

export function CatalogoPage() {
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [pagina, setPagina] = useState(0)
  const busquedaDemorada = useDebounce(busqueda)

  const { data: categorias } = useCategorias()
  const { data, isLoading, isError, error, refetch } = useProductos({
    skip: pagina * PRODUCTOS_POR_PAGINA, // la paginacion se hace en el servidor
    limit: PRODUCTOS_POR_PAGINA,
    search: busquedaDemorada.trim() || undefined,
    categoria_id: categoriaId ? Number(categoriaId) : undefined,
  })

  const hayFiltros = busqueda !== '' || categoriaId !== ''
  const totalPaginas = data ? Math.ceil(data.total / PRODUCTOS_POR_PAGINA) : 0

  return (
    <div>
      <h1 className="text-3xl font-bold">Qué te pinta comer hoy</h1>
      <p className="mt-1 text-ink/70">Armá tu carrito y confirmá el pedido. Pagás en efectivo o por transferencia.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_16rem_auto] sm:items-end">
        <Input
          label="Buscar"
          type="search"
          placeholder="Hamburguesa, pizza, flan…"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value)
            setPagina(0)
          }}
        />
        <Select
          label="Categoría"
          value={categoriaId}
          onChange={(e) => {
            setCategoriaId(e.target.value)
            setPagina(0)
          }}
        >
          <option value="">Todas</option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Select>
        {hayFiltros && (
          <Button
            variante="texto"
            onClick={() => {
              setBusqueda('')
              setCategoriaId('')
              setPagina(0)
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Cargando productos">
            {Array.from({ length: PRODUCTOS_POR_PAGINA }, (_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : isError ? (
          <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
        ) : data && data.items.length === 0 ? (
          <EstadoVacio
            titulo="No encontramos productos"
            descripcion={hayFiltros ? 'Probá con otra búsqueda o sacá los filtros.' : 'Todavía no hay productos cargados.'}
          />
        ) : (
          data && (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {data.items.map((producto) => (
                  <ProductoCard key={producto.id} producto={producto} />
                ))}
              </div>
              <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
            </>
          )
        )}
      </div>
    </div>
  )
}
