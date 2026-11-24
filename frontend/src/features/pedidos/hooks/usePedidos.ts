import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getPedido, getPedidos } from '../api/pedidos'
import type { FiltrosPedidos } from '../types/pedido'

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => getPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function usePedido(id: number | null) {
  return useQuery({
    queryKey: ['pedido', id],
    queryFn: () => getPedido(id as number),
    enabled: id !== null,
  })
}
