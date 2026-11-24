import type { ReactNode } from 'react'

interface EstadoVacioProps {
  titulo: string
  descripcion?: string
  accion?: ReactNode
}

export function EstadoVacio({ titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-white px-6 py-12 text-center">
      <h3 className="text-lg font-bold">{titulo}</h3>
      {descripcion && <p className="mx-auto mt-1 max-w-md text-ink/70">{descripcion}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  )
}
