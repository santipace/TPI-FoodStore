import type { ReactNode } from 'react'

type Tipo = 'error' | 'exito'

const ESTILOS: Record<Tipo, string> = {
  error: 'bg-chile-50 text-chile border-chile/30',
  exito: 'bg-brand-50 text-brand-800 border-brand-600/30',
}

export function Alerta({ tipo, children }: { tipo: Tipo; children: ReactNode }) {
  return (
    <p role={tipo === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-3 py-2 text-sm ${ESTILOS[tipo]}`}>
      {children}
    </p>
  )
}
