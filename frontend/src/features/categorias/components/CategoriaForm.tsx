import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { mensajeError } from '../../../shared/lib/formErrors'
import { Alerta } from '../../../shared/ui/Alerta'
import { Button } from '../../../shared/ui/Button'
import { Input, Textarea } from '../../../shared/ui/Input'
import type { Categoria, CategoriaPayload } from '../types/categoria'

interface CategoriaFormProps {
  inicial?: Categoria
  onGuardar: (payload: CategoriaPayload) => Promise<unknown>
  onCancelar: () => void
}

export function CategoriaForm({ inicial, onGuardar, onCancelar }: CategoriaFormProps) {
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { nombre: inicial?.nombre ?? '', descripcion: inicial?.descripcion ?? '' },
    onSubmit: async ({ value }) => {
      setErrorServidor(null)
      try {
        await onGuardar({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null })
      } catch (error) {
        setErrorServidor(handleApiError(error, 'No se pudo guardar la categoría'))
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
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            return largo >= 2 && largo <= 100 ? undefined : 'El nombre debe tener entre 2 y 100 caracteres'
          },
        }}
      >
        {(field) => (
          <Input
            label="Nombre"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={mensajeError(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <Textarea
            label="Descripción (opcional)"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
          />
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
              {inicial ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
