import { Link } from 'react-router-dom'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'

export function UnauthorizedPage() {
  return (
    <EstadoVacio
      titulo="No tenés permiso para ver esta pantalla"
      descripcion="Esta sección es solo para administradores."
      accion={
        <Link to="/" className="font-semibold text-brand-700 underline">
          Volver al inicio
        </Link>
      }
    />
  )
}
