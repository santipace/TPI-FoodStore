import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { actualizarCategoria, crearCategoria, eliminarCategoria, getCategorias } from '../api/categorias'
import type { CategoriaPayload } from '../types/categoria'

export function useCategorias() {
  return useQuery({ queryKey: ['categorias'], queryFn: getCategorias })
}

function useInvalidarCategorias() {
  const queryClient = useQueryClient()
  return async () => {
    await queryClient.invalidateQueries({ queryKey: ['categorias'] })
    await queryClient.invalidateQueries({ queryKey: ['productos'] }) // los productos traen su categoria
  }
}

export function useCrearCategoria() {
  const invalidar = useInvalidarCategorias()
  return useMutation({ mutationFn: (payload: CategoriaPayload) => crearCategoria(payload), onSuccess: invalidar })
}

export function useActualizarCategoria() {
  const invalidar = useInvalidarCategorias()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoriaPayload }) => actualizarCategoria(id, payload),
    onSuccess: invalidar,
  })
}

export function useEliminarCategoria() {
  const invalidar = useInvalidarCategorias()
  return useMutation({ mutationFn: (id: number) => eliminarCategoria(id), onSuccess: invalidar })
}
