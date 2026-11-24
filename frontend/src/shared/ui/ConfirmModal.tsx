import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmModalProps {
  abierto: boolean
  titulo: string
  mensaje: string
  textoConfirmar: string
  cargando?: boolean
  error?: string | null
  onConfirmar: () => void
  onCerrar: () => void
}

export function ConfirmModal({
  abierto,
  titulo,
  mensaje,
  textoConfirmar,
  cargando = false,
  error,
  onConfirmar,
  onCerrar,
}: ConfirmModalProps) {
  return (
    <Modal abierto={abierto} titulo={titulo} onCerrar={onCerrar}>
      <p className="text-ink/80">{mensaje}</p>
      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-chile-50 px-3 py-2 text-sm text-chile">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <Button variante="secundario" onClick={onCerrar}>
          Volver
        </Button>
        <Button variante="peligro" cargando={cargando} onClick={onConfirmar}>
          {textoConfirmar}
        </Button>
      </div>
    </Modal>
  )
}
