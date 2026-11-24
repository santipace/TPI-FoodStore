import { api } from '../../../shared/api/axiosInstance'
import type { RegistroPayload, Usuario } from '../types/auth'

export async function registrarUsuario(payload: RegistroPayload): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/auth/register', payload)
  return data
}
