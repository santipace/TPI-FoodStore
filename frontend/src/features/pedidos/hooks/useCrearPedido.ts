import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearPedido } from '../api/pedidos'
import type { PedidoCreatePayload } from '../types/pedido'

export function useCrearPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: PedidoCreatePayload) => crearPedido(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      await queryClient.invalidateQueries({ queryKey: ['productos'] }) // el stock cambio
      await queryClient.invalidateQueries({ queryKey: ['resumen-pedidos'] })
    },
  })
}
