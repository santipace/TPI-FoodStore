import axios from 'axios'

// Cliente HTTP unico. withCredentials hace que el navegador envie la cookie HttpOnly con el JWT:
// el frontend nunca lee ni guarda el token.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

let alQuedarSinSesion: (() => void) | null = null

/** El authStore registra aca como limpiar la sesion (evita un import circular con el store). */
export function registrarManejadorSinSesion(manejador: () => void): void {
  alQuedarSinSesion = manejador
}

const RUTAS_DE_SESION = ['/auth/token', '/auth/me']

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (axios.isAxiosError<{ detail?: unknown }>(error)) {
      const status = error.response?.status
      const url = error.config?.url ?? ''
      const detail = error.response?.data?.detail
      const esRutaDeSesion = RUTAS_DE_SESION.some((ruta) => url.includes(ruta))
      const cuentaDesactivada = status === 400 && detail === 'Cuenta de usuario desactivada'
      // 401 fuera del login y de /auth/me, o cuenta desactivada: se limpia la sesion.
      // La vuelta a /login la hace ProtectedRoute al quedar sin usuario.
      if ((status === 401 && !esRutaDeSesion) || cuentaDesactivada) {
        alQuedarSinSesion?.()
      }
    }
    return Promise.reject(error)
  },
)
