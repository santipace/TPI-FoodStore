import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { mensajeError } from '../../../shared/lib/formErrors'
import { Alerta } from '../../../shared/ui/Alerta'
import { Button } from '../../../shared/ui/Button'
import { Input, Select, Textarea } from '../../../shared/ui/Input'
import type { FormaPago } from '../types/pedido'

interface DatosCheckout {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string | null
}

interface CheckoutFormProps {
  onConfirmar: (datos: DatosCheckout) => Promise<unknown>
}

export function CheckoutForm({ onConfirmar }: CheckoutFormProps) {
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: async ({ value }) => {
      setErrorServidor(null)
      try {
        await onConfirmar({
          direccion_entrega: value.direccion_entrega.trim(),
          forma_pago: value.forma_pago,
          notas: value.notas.trim() || null,
        })
      } catch (error) {
        setErrorServidor(handleApiError(error, 'No se pudo confirmar el pedido'))
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
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            return largo >= 5 && largo <= 200 ? undefined : 'La dirección debe tener entre 5 y 200 caracteres'
          },
        }}
      >
        {(field) => (
          <Input
            label="Dirección de entrega"
            placeholder="Calle, número y localidad"
            autoComplete="street-address"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={mensajeError(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <Select
            label="Forma de pago"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value as FormaPago)}
            onBlur={field.handleBlur}
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </Select>
        )}
      </form.Field>

      <form.Field
        name="notas"
        validators={{ onChange: ({ value }) => (value.length <= 500 ? undefined : 'Las notas admiten hasta 500 caracteres') }}
      >
        {(field) => (
          <Textarea
            label="Notas (opcional)"
            placeholder="Timbre, piso, aclaraciones…"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={mensajeError(field.state.meta)}
          />
        )}
      </form.Field>

      {errorServidor && <Alerta tipo="error">{errorServidor}</Alerta>}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(enviando) => (
          <Button type="submit" className="w-full" cargando={enviando}>
            Confirmar pedido
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
