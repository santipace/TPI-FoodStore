import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Alerta } from '../../../shared/ui/Alerta'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { ConfirmModal } from '../../../shared/ui/ConfirmModal'
import { Modal } from '../../../shared/ui/Modal'
import { CategoriaForm } from '../components/CategoriaForm'
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from '../hooks/useCategorias'
import type { Categoria } from '../types/categoria'

const columna = createColumnHelper<Categoria>()

type Dialogo = { tipo: 'crear' } | { tipo: 'editar'; categoria: Categoria } | { tipo: 'eliminar'; categoria: Categoria } | null

export function AdminCategoriasPage() {
  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [errorBorrado, setErrorBorrado] = useState<string | null>(null)

  const { data, isLoading, isError, error, refetch } = useCategorias()
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const eliminar = useEliminarCategoria()

  const columnas = useMemo(
    () => [
      columna.accessor('nombre', { header: 'Nombre', cell: (info) => <span className="font-semibold">{info.getValue()}</span> }),
      columna.accessor((c) => c.descripcion ?? '—', { id: 'descripcion', header: 'Descripción' }),
      columna.display({
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => (
          <div className="flex gap-1">
            <Button variante="texto" tamano="sm" onClick={() => setDialogo({ tipo: 'editar', categoria: info.row.original })}>
              Editar
            </Button>
            <Button
              variante="texto"
              tamano="sm"
              className="text-chile hover:bg-chile-50"
              onClick={() => {
                setErrorBorrado(null)
                setDialogo({ tipo: 'eliminar', categoria: info.row.original })
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
    data: data ?? [],
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  })

  const cerrar = () => setDialogo(null)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={() => setDialogo({ tipo: 'crear' })}>Nueva categoría</Button>
      </div>
      {aviso && (
        <div className="mb-4">
          <Alerta tipo="exito">{aviso}</Alerta>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-48" />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : data && data.length === 0 ? (
        <EstadoVacio titulo="Todavía no hay categorías" descripcion="Creá la primera con el botón «Nueva categoría»." />
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
                    <td key={celda.id} className="px-4 py-3">
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

      <Modal abierto={dialogo?.tipo === 'crear'} titulo="Nueva categoría" onCerrar={cerrar}>
        {dialogo?.tipo === 'crear' && (
          <CategoriaForm
            onCancelar={cerrar}
            onGuardar={async (payload) => {
              await crear.mutateAsync(payload)
              setAviso(`Categoría «${payload.nombre}» creada`)
              cerrar()
            }}
          />
        )}
      </Modal>

      <Modal abierto={dialogo?.tipo === 'editar'} titulo="Editar categoría" onCerrar={cerrar}>
        {dialogo?.tipo === 'editar' && (
          <CategoriaForm
            inicial={dialogo.categoria}
            onCancelar={cerrar}
            onGuardar={async (payload) => {
              await actualizar.mutateAsync({ id: dialogo.categoria.id, payload })
              setAviso(`Categoría «${payload.nombre}» actualizada`)
              cerrar()
            }}
          />
        )}
      </Modal>

      <ConfirmModal
        abierto={dialogo?.tipo === 'eliminar'}
        titulo="Eliminar categoría"
        mensaje={
          dialogo?.tipo === 'eliminar'
            ? `¿Eliminar «${dialogo.categoria.nombre}»? Es una baja lógica: el nombre sigue reservado y sus productos no se ocultan solos.`
            : ''
        }
        textoConfirmar="Eliminar"
        cargando={eliminar.isPending}
        error={errorBorrado}
        onCerrar={cerrar}
        onConfirmar={() => {
          if (dialogo?.tipo !== 'eliminar') return
          const { categoria } = dialogo
          eliminar.mutate(categoria.id, {
            onSuccess: () => {
              setAviso(`Categoría «${categoria.nombre}» eliminada`)
              cerrar()
            },
            onError: (e) => setErrorBorrado(handleApiError(e, 'No se pudo eliminar la categoría')),
          })
        }}
      />
    </div>
  )
}
