import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '../features/auth/types/auth'
import { api, registrarManejadorSinSesion } from '../shared/api/axiosInstance'
import { queryClient } from '../shared/api/queryClient'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        // El backend responde con la cookie HttpOnly; el cuerpo no trae el token.
        await api.post('/auth/token', new URLSearchParams({ username, password }))
        const { data } = await api.get<Usuario>('/auth/me')
        set({ usuario: data })
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } finally {
          queryClient.clear()
          set({ usuario: null })
        }
      },

      // Se llama una sola vez al montar la app: confirma con /auth/me si la cookie sigue valida.
      checkSession: async () => {
        try {
          const { data } = await api.get<Usuario>('/auth/me')
          set({ usuario: data })
        } catch {
          set({ usuario: null })
        } finally {
          set({ cargando: false })
        }
      },

      limpiarSesion: () => {
        queryClient.clear()
        set({ usuario: null })
      },
    }),
    {
      name: 'food-store-auth',
      // Solo se persiste el usuario (nombre, email, rol...). Nunca el token: vive en la cookie HttpOnly.
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)

registrarManejadorSinSesion(() => useAuthStore.getState().limpiarSesion())
