import { useEffect } from 'react'
import { AppRouter } from './routes/AppRouter'
import { useAuthStore } from './store/authStore'

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  // Unica llamada en useEffect: confirma la sesion con /auth/me al montar la aplicacion.
  useEffect(() => {
    void checkSession()
  }, [checkSession])

  return <AppRouter />
}
