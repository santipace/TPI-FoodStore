import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarProducto,
  actualizarStock,
  crearProducto,
  eliminarProducto,
  getProductos,
} from '../api/productos'
import type { FiltrosProductos, ProductoPayload, ProductoStockPayload } from '../types/producto'

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => getProductos(filtros),
    placeholderData: keepPreviousData, // mantiene la pagina anterior mientras llega la nueva
  })
}

function useInvalidarProductos() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['productos'] })
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({ mutationFn: (payload: ProductoPayload) => crearProducto(payload), onSuccess: invalidar })
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductoPayload }) => actualizarProducto(id, payload),
    onSuccess: invalidar,
  })
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductoStockPayload }) => actualizarStock(id, payload),
    onSuccess: invalidar,
  })
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({ mutationFn: (id: number) => eliminarProducto(id), onSuccess: invalidar })
}
