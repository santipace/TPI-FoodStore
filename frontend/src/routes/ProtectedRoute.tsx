import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Rol } from '../features/auth/types/auth'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  roles?: Rol[]
}

/** Sin sesion redirige a /login; sin el rol permitido, a /unauthorized. La proteccion real esta en el backend. */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const location = useLocation()

  if (cargando) {
    return (
      <p role="status" className="py-16 text-center text-ink/60">
        Verificando sesión…
      </p>
    )
  }
  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  return <Outlet />
}
