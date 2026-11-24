import { Button } from '../ui/Button'

interface PaginacionProps {
  pagina: number // base 0
  totalPaginas: number
  onCambiar: (pagina: number) => void
}

export function Paginacion({ pagina, totalPaginas, onCambiar }: PaginacionProps) {
  if (totalPaginas <= 1) return null
  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-3 py-4">
      <Button variante="secundario" tamano="sm" disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>
        Anterior
      </Button>
      <span className="text-sm text-ink/70">
        Página {pagina + 1} de {totalPaginas}
      </span>
      <Button
        variante="secundario"
        tamano="sm"
        disabled={pagina >= totalPaginas - 1}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente
      </Button>
    </nav>
  )
}
