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
import { useAuthStore } from '../../../store/authStore'
import type { Usuario } from '../../auth/types/auth'
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '../hooks/useUsuarios'

const columna = createColumnHelper<Usuario>()

export function AdminUsuariosPage() {
  const usuarioActual = useAuthStore((s) => s.usuario)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null)

  const { data, isLoading, isError, error, refetch } = useUsuarios()
  const activar = useActivarUsuario()
  const desactivar = useDesactivarUsuario()

  const columnas = useMemo(
    () => [
      columna.accessor('username', { header: 'Usuario', cell: (info) => <span className="font-semibold">{info.getValue()}</span> }),
      columna.accessor('full_name', { header: 'Nombre' }),
      columna.accessor('email', { header: 'Email' }),
      columna.accessor('role', { header: 'Rol', cell: (info) => (info.getValue() === 'admin' ? 'Administrador' : 'Cliente') }),
      columna.accessor('disabled', {
        header: 'Estado',
        cell: (info) =>
          info.getValue() ? (
            <span className="rounded-full bg-chile-50 px-2.5 py-0.5 text-sm font-semibold text-chile">Desactivado</span>
          ) : (
            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-sm font-semibold text-brand-800">Activo</span>
          ),
      }),
      columna.display({
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => {
          const u = info.row.original
          if (u.disabled) {
            return (
              <Button
                variante="secundario"
                tamano="sm"
                cargando={activar.isPending && activar.variables === u.id}
                onClick={() =>
                  activar.mutate(u.id, {
                    onSuccess: () => setMensaje({ tipo: 'exito', texto: `Usuario «${u.username}» activado` }),
                    onError: (e) => setMensaje({ tipo: 'error', texto: handleApiError(e) }),
                  })
                }
              >
                Activar
              </Button>
            )
          }
          // El boton Desactivar no se muestra en la fila del usuario de la sesion.
          if (u.id === usuarioActual?.id) return <span className="text-sm text-ink/50">Es tu cuenta</span>
          return (
            <Button
              variante="peligro"
              tamano="sm"
              cargando={desactivar.isPending && desactivar.variables === u.id}
              onClick={() =>
                desactivar.mutate(u.id, {
                  onSuccess: () => setMensaje({ tipo: 'exito', texto: `Usuario «${u.username}» desactivado` }),
                  onError: (e) => setMensaje({ tipo: 'error', texto: handleApiError(e) }),
                })
              }
            >
              Desactivar
            </Button>
          )
        },
      }),
    ],
    [usuarioActual?.id, activar, desactivar],
  )

  const tabla = useReactTable({
    data: data ?? [],
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Usuarios</h1>
      {mensaje && (
        <div className="mb-4">
          <Alerta tipo={mensaje.tipo}>{mensaje.texto}</Alerta>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-48" />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : data && data.length === 0 ? (
        <EstadoVacio titulo="No hay usuarios registrados" />
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
    </div>
  )
}
