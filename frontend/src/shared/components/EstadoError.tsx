import { Button } from '../ui/Button'

interface EstadoErrorProps {
  mensaje: string
  onReintentar?: () => void
}

export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div role="alert" className="rounded-xl border border-chile/30 bg-chile-50 px-6 py-8 text-center">
      <h3 className="text-lg font-bold text-chile">No pudimos cargar los datos</h3>
      <p className="mt-1 text-ink/80">{mensaje}</p>
      {onReintentar && (
        <Button className="mt-4" variante="secundario" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
