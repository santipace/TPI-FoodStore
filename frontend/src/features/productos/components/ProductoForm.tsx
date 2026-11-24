import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { mensajeError } from '../../../shared/lib/formErrors'
import { Alerta } from '../../../shared/ui/Alerta'
import { Button } from '../../../shared/ui/Button'
import { Input, Select, Textarea } from '../../../shared/ui/Input'
import type { Categoria } from '../../categorias/types/categoria'
import type { Producto, ProductoPayload } from '../types/producto'

interface ProductoFormProps {
  inicial?: Producto
  categorias: Categoria[]
  onGuardar: (payload: ProductoPayload) => Promise<unknown>
  onCancelar: () => void
}

export function ProductoForm({ inicial, categorias, onGuardar, onCancelar }: ProductoFormProps) {
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      nombre: inicial?.nombre ?? '',
      descripcion: inicial?.descripcion ?? '',
      categoria_id: inicial ? String(inicial.categoria_id) : '',
      precio_base: inicial ? String(inicial.precio_base) : '',
      stock: inicial ? String(inicial.stock) : '0',
      imagen_url: inicial?.imagen_url ?? '',
      disponible: inicial?.disponible ?? true,
    },
    onSubmit: async ({ value }) => {
      setErrorServidor(null)
      try {
        await onGuardar({
          nombre: value.nombre.trim(),
          descripcion: value.descripcion.trim() || null,
          categoria_id: Number(value.categoria_id),
          precio_base: Number(value.precio_base),
          stock: Number(value.stock),
          imagen_url: value.imagen_url.trim() || null,
          disponible: value.disponible,
        })
      } catch (error) {
        setErrorServidor(handleApiError(error, 'No se pudo guardar el producto'))
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
      <form.Field name="nombre" validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'El nombre es obligatorio') }}>
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
            label="Descripción"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (value ? undefined : 'Elegí una categoría') }}
      >
        {(field) => (
          <Select
            label="Categoría"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={mensajeError(field.state.meta)}
          >
            <option value="">Seleccioná una categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) =>
              value !== '' && Number(value) >= 0 ? undefined : 'El precio debe ser un número mayor o igual a 0',
          }}
        >
          {(field) => (
            <Input
              label="Precio"
              type="number"
              min="0"
              step="0.01"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={mensajeError(field.state.meta)}
            />
          )}
        </form.Field>

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
              label="Stock"
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
      </div>

      <form.Field name="imagen_url">
        {(field) => (
          <Input
            label="URL de la imagen (opcional)"
            type="url"
            placeholder="https://…"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
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
              {inicial ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
