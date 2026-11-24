import { NavLink, Outlet } from 'react-router-dom'

const SECCIONES = [
  { to: '/admin/resumen', texto: 'Resumen' },
  { to: '/admin/pedidos', texto: 'Pedidos' },
  { to: '/admin/productos', texto: 'Productos' },
  { to: '/admin/categorias', texto: 'Categorías' },
  { to: '/admin/usuarios', texto: 'Usuarios' },
]

export function AdminLayout() {
  return (
    <div>
      <nav aria-label="Panel de administración" className="mb-6 flex flex-wrap gap-1 border-b border-line">
        {SECCIONES.map((s) => (
          <NavLink
            key={s.to}
            to={s.to}
            className={({ isActive }) =>
              `-mb-px border-b-2 px-4 py-2 font-semibold transition-colors ${
                isActive ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink/60 hover:text-ink'
              }`
            }
          >
            {s.texto}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
