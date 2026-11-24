import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { mensajeError } from '../../../shared/lib/formErrors'
import { Alerta } from '../../../shared/ui/Alerta'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import type { Producto, ProductoStockPayload } from '../types/producto'

interface StockFormProps {
  producto: Producto
  onGuardar: (payload: ProductoStockPayload) => Promise<unknown>
  onCancelar: () => void
}

export function StockForm({ producto, onGuardar, onCancelar }: StockFormProps) {
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      setErrorServidor(null)
      try {
        await onGuardar({ stock: Number(value.stock), disponible: value.disponible })
      } catch (error) {
        setErrorServidor(handleApiError(error, 'No se pudo actualizar el stock'))
      }
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <p className="text-ink/70">
        Stock actual de <strong>{producto.nombre}</strong>: {producto.stock}
      </p>

      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) =>
            value !== '' && Number.isInteger(Number(value)) && Number(value) >= 0
              ? undefined
              : 'El stock debe ser un entero mayor o igual a 0',
        }}
      >
        {(field) => (
          <Input
            label="Nuevo stock"
            type="number"
            min="0"
            step="1"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={mensajeError(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 font-semibold">
            <input
              type="checkbox"
              className="size-4 accent-brand-600"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>

      {errorServidor && <Alerta tipo="error">{errorServidor}</Alerta>}

      <div className="flex justify-end gap-2 pt-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(enviando) => (
            <Button type="submit" cargando={enviando}>
              Guardar stock
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
