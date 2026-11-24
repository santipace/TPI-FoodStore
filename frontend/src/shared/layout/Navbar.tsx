import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../ui/Button'

const ETIQUETA_ROL = { admin: 'Administrador', user: 'Cliente' } as const

function claseLink({ isActive }: { isActive: boolean }): string {
  return `rounded-md px-3 py-1.5 font-semibold transition-colors ${
    isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:text-white'
  }`
}

export function Navbar() {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidadEnCarrito = useCartStore((s) => s.items.reduce((suma, i) => suma + i.cantidad, 0))

  async function cerrarSesion() {
    await logout().catch(() => undefined)
    navigate('/login')
  }

  return (
    <header className="bg-ink text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link to="/" className="font-display text-2xl font-bold tracking-tight">
          Food Store
        </Link>

        <nav className="flex flex-wrap items-center gap-1" aria-label="Principal">
          <NavLink to="/" end className={claseLink}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={claseLink}>
            Carrito
            {cantidadEnCarrito > 0 && (
              <span className="ml-2 rounded-full bg-saffron px-2 py-0.5 text-sm font-bold text-ink">
                {cantidadEnCarrito}
              </span>
            )}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={claseLink}>
              Mis pedidos
            </NavLink>
          )}
          {usuario?.role === 'admin' && (
            <NavLink to="/admin/resumen" className={claseLink}>
              Panel de administración
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {usuario ? (
            <>
              <div className="text-right leading-tight">
                <p className="font-semibold">{usuario.full_name}</p>
                <p className="text-sm text-white/70">{ETIQUETA_ROL[usuario.role]}</p>
              </div>
              <Button variante="secundario" tamano="sm" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-semibold text-white/85 hover:text-white">
                Iniciar sesión
              </Link>
              <Link to="/register" className="rounded-lg bg-white px-3 py-1.5 font-semibold text-ink hover:bg-brand-50">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
