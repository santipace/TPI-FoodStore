import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'peligro' | 'texto'
type Tamano = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamano?: Tamano
  cargando?: boolean
}

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/50',
  secundario: 'bg-white text-ink border border-line hover:bg-brand-50 disabled:text-ink/40',
  peligro: 'bg-chile text-white hover:bg-chile/90 disabled:bg-chile/50',
  texto: 'bg-transparent text-brand-700 hover:bg-brand-50 disabled:text-ink/40',
}

const TAMANOS: Record<Tamano, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
}

export function Button({
  variante = 'primario',
  tamano = 'md',
  cargando = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...resto
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
      {...resto}
    >
      {cargando ? 'Procesando…' : children}
    </button>
  )
}
