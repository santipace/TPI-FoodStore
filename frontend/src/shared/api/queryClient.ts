import { QueryClient } from '@tanstack/react-query'

// Instancia unica de TanStack Query para toda la aplicacion.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    },
  },
})
