import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
}

export function Modal({ abierto, titulo, onCerrar, children }: ModalProps) {
  useEffect(() => {
    if (!abierto) return
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', alPresionar)
    return () => document.removeEventListener('keydown', alPresionar)
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onCerrar} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-md px-2 py-1 text-2xl leading-none text-ink/60 hover:bg-paper"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
