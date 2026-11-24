import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { formatearPrecio } from '../../../shared/lib/format'
import { Alerta } from '../../../shared/ui/Alerta'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { ConfirmModal } from '../../../shared/ui/ConfirmModal'
import { Modal } from '../../../shared/ui/Modal'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoForm } from '../components/ProductoForm'
import { StockForm } from '../components/StockForm'
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos'
import type { Producto } from '../types/producto'

const columna = createColumnHelper<Producto>()

type Dialogo =
  | { tipo: 'crear' }
  | { tipo: 'editar'; producto: Producto }
  | { tipo: 'stock'; producto: Producto }
  | { tipo: 'eliminar'; producto: Producto }
  | null

export function AdminProductosPage() {
  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [errorBorrado, setErrorBorrado] = useState<string | null>(null)

  // El panel pide limit=100 y pagina del lado del cliente con TanStack Table.
  const { data, isLoading, isError, error, refetch } = useProductos({ limit: 100 })
  const { data: categorias = [] } = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const cambiarStock = useActualizarStock()
  const eliminar = useEliminarProducto()

  const columnas = useMemo(
    () => [
      columna.accessor('nombre', {
        header: 'Producto',
        cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
      }),
      columna.accessor((p) => p.categoria?.nombre ?? '—', { id: 'categoria', header: 'Categoría' }),
      columna.accessor('precio_base', {
        header: 'Precio',
        cell: (info) => formatearPrecio(info.getValue()),
      }),
      columna.accessor('stock', { header: 'Stock' }),
      columna.accessor('disponible', {
        header: 'Estado',
        cell: (info) =>
          info.getValue() ? (
            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-sm font-semibold text-brand-800">Disponible</span>
          ) : (
            <span className="rounded-full bg-paper px-2.5 py-0.5 text-sm font-semibold text-ink/60">No disponible</span>
          ),
      }),
      columna.display({
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => (
          <div className="flex flex-wrap gap-1">
            <Button variante="texto" tamano="sm" onClick={() => setDialogo({ tipo: 'editar', producto: info.row.original })}>
              Editar
            </Button>
            <Button variante="texto" tamano="sm" onClick={() => setDialogo({ tipo: 'stock', producto: info.row.original })}>
              Stock
            </Button>
            <Button
              variante="texto"
              tamano="sm"
              className="text-chile hover:bg-chile-50"
              onClick={() => {
                setErrorBorrado(null)
                setDialogo({ tipo: 'eliminar', producto: info.row.original })
              }}
            >
              Eliminar
            </Button>
          </div>
        ),
      }),
    ],
    [],
  )

  const tabla = useReactTable({
    data: data?.items ?? [],
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  })

  const cerrar = () => setDialogo(null)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={() => setDialogo({ tipo: 'crear' })} disabled={categorias.length === 0}>
          Nuevo producto
        </Button>
      </div>
      {categorias.length === 0 && !isLoading && (
        <div className="mb-4">
          <Alerta tipo="error">Primero creá al menos una categoría para poder cargar productos.</Alerta>
        </div>
      )}
      {aviso && (
        <div className="mb-4">
          <Alerta tipo="exito">{aviso}</Alerta>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : data && data.items.length === 0 ? (
        <EstadoVacio titulo="Todavía no hay productos" descripcion="Creá el primero con el botón «Nuevo producto»." />
      ) : (
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
      )}
      <Paginacion
        pagina={tabla.getState().pagination.pageIndex}
        totalPaginas={tabla.getPageCount()}
        onCambiar={(p) => tabla.setPageIndex(p)}
      />

      <Modal abierto={dialogo?.tipo === 'crear'} titulo="Nuevo producto" onCerrar={cerrar}>
        {dialogo?.tipo === 'crear' && (
          <ProductoForm
            categorias={categorias}
            onCancelar={cerrar}
            onGuardar={async (payload) => {
              await crear.mutateAsync(payload)
              setAviso(`Producto «${payload.nombre}» creado`)
              cerrar()
            }}
          />
        )}
      </Modal>

      <Modal abierto={dialogo?.tipo === 'editar'} titulo="Editar producto" onCerrar={cerrar}>
        {dialogo?.tipo === 'editar' && (
          <ProductoForm
            inicial={dialogo.producto}
            categorias={categorias}
            onCancelar={cerrar}
            onGuardar={async (payload) => {
              await actualizar.mutateAsync({ id: dialogo.producto.id, payload })
              setAviso(`Producto «${payload.nombre}» actualizado`)
              cerrar()
            }}
          />
        )}
      </Modal>

      <Modal abierto={dialogo?.tipo === 'stock'} titulo="Cambiar stock y disponibilidad" onCerrar={cerrar}>
        {dialogo?.tipo === 'stock' && (
          <StockForm
            producto={dialogo.producto}
            onCancelar={cerrar}
            onGuardar={async (payload) => {
              await cambiarStock.mutateAsync({ id: dialogo.producto.id, payload })
              setAviso(`Stock de «${dialogo.producto.nombre}» actualizado a ${payload.stock}`)
              cerrar()
            }}
          />
        )}
      </Modal>

      <ConfirmModal
        abierto={dialogo?.tipo === 'eliminar'}
        titulo="Eliminar producto"
        mensaje={
          dialogo?.tipo === 'eliminar'
            ? `¿Eliminar «${dialogo.producto.nombre}»? Deja de mostrarse en el catálogo (baja lógica); los pedidos anteriores no cambian.`
            : ''
        }
        textoConfirmar="Eliminar"
        cargando={eliminar.isPending}
        error={errorBorrado}
        onCerrar={cerrar}
        onConfirmar={() => {
          if (dialogo?.tipo !== 'eliminar') return
          const { producto } = dialogo
          eliminar.mutate(producto.id, {
            onSuccess: () => {
              setAviso(`Producto «${producto.nombre}» eliminado`)
              cerrar()
            },
            onError: (e) => setErrorBorrado(handleApiError(e, 'No se pudo eliminar el producto')),
          })
        }}
      />
    </div>
  )
}
