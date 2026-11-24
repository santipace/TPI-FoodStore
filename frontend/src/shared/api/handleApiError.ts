import axios from 'axios'

interface ErrorDeValidacion {
  msg?: string
  loc?: unknown[]
}

/** Convierte el `detail` de la API (texto o lista de errores 422) en un mensaje para la pantalla. */
export function handleApiError(error: unknown, mensajePorDefecto = 'Ocurrió un error inesperado'): string {
  if (axios.isAxiosError<{ detail?: unknown }>(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Revisá que el backend esté corriendo.'
    }
    const detail = error.response.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      const mensajes = (detail as ErrorDeValidacion[])
        .map((e) => e.msg)
        .filter((m): m is string => typeof m === 'string')
      if (mensajes.length > 0) return mensajes.join('. ')
    }
    return mensajePorDefecto
  }
  return error instanceof Error ? error.message : mensajePorDefecto
}
