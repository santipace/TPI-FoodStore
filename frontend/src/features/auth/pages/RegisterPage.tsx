import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { mensajeError } from '../../../shared/lib/formErrors'
import { Alerta } from '../../../shared/ui/Alerta'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { registrarUsuario } from '../api/auth'

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const navigate = useNavigate()
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const registrar = useMutation({ mutationFn: registrarUsuario })

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '', confirmacion: '' },
    onSubmit: async ({ value }) => {
      setErrorServidor(null)
      try {
        await registrar.mutateAsync({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        })
        navigate('/login', { replace: true, state: { registrado: true } })
      } catch (error) {
        setErrorServidor(handleApiError(error, 'No se pudo crear la cuenta'))
      }
    },
  })

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold">Crear cuenta</h1>
      <Card className="p-6">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="full_name"
            validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá tu nombre completo') }}
          >
            {(field) => (
              <Input
                label="Nombre completo"
                autoComplete="name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mensajeError(field.state.meta)}
              />
            )}
          </form.Field>

          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) => (value.trim().length >= 3 ? undefined : 'El usuario debe tener al menos 3 caracteres'),
            }}
          >
            {(field) => (
              <Input
                label="Usuario"
                autoComplete="username"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mensajeError(field.state.meta)}
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{ onChange: ({ value }) => (REGEX_EMAIL.test(value.trim()) ? undefined : 'Ingresá un email válido') }}
          >
            {(field) => (
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mensajeError(field.state.meta)}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => (value.length >= 8 ? undefined : 'La contraseña debe tener al menos 8 caracteres'),
            }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mensajeError(field.state.meta)}
              />
            )}
          </form.Field>

          <form.Field
            name="confirmacion"
            validators={{
              onChangeListenTo: ['password'],
              onChange: ({ value, fieldApi }) =>
                value === fieldApi.form.getFieldValue('password') ? undefined : 'Las contraseñas no coinciden',
            }}
          >
            {(field) => (
              <Input
                label="Repetí la contraseña"
                type="password"
                autoComplete="new-password"
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
                Crear cuenta
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Card>
      <p className="mt-4 text-center text-ink/70">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-semibold text-brand-700 underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  )
}
