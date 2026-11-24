import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelarPedido } from '../api/pedidos'

export function useCancelarPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      await queryClient.invalidateQueries({ queryKey: ['pedido'] })
      await queryClient.invalidateQueries({ queryKey: ['productos'] }) // se restituyo el stock
      await queryClient.invalidateQueries({ queryKey: ['resumen-pedidos'] })
    },
  })
}
