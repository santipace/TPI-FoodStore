import { useQuery } from '@tanstack/react-query'
import { getResumenPedidos } from '../api/pedidos'

export function useResumenPedidos() {
  return useQuery({ queryKey: ['resumen-pedidos'], queryFn: getResumenPedidos })
}
