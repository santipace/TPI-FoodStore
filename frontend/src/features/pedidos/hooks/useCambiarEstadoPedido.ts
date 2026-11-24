import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cambiarEstadoPedido } from '../api/pedidos'
import type { EstadoPedido } from '../types/pedido'

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      await queryClient.invalidateQueries({ queryKey: ['pedido'] })
      await queryClient.invalidateQueries({ queryKey: ['productos'] }) // si se cancela, se restituye stock
      await queryClient.invalidateQueries({ queryKey: ['resumen-pedidos'] })
    },
  })
}
