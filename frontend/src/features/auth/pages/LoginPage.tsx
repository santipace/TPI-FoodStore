import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { mensajeError } from '../../../shared/lib/formErrors'
import { Alerta } from '../../../shared/ui/Alerta'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { useAuthStore } from '../../../store/authStore'

interface EstadoDeNavegacion {
  from?: { pathname: string }
  registrado?: boolean
}

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const estado = location.state as EstadoDeNavegacion | null
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setErrorServidor(null)
      try {
        await login(value.username.trim(), value.password)
        const rol = useAuthStore.getState().usuario?.role
        navigate(estado?.from?.pathname ?? (rol === 'admin' ? '/admin/resumen' : '/'), { replace: true })
      } catch (error) {
        setErrorServidor(handleApiError(error, 'No se pudo iniciar sesión'))
      }
    },
  })

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold">Iniciar sesión</h1>
      <Card className="p-6">
        {estado?.registrado && (
          <div className="mb-4">
            <Alerta tipo="exito">Cuenta creada. Ya podés iniciar sesión.</Alerta>
          </div>
        )}
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá tu usuario') }}
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
            name="password"
            validators={{ onChange: ({ value }) => (value ? undefined : 'Ingresá tu contraseña') }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="current-password"
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
                Ingresar
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Card>
      <p className="mt-4 text-center text-ink/70">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="font-semibold text-brand-700 underline">
          Registrate
        </Link>
      </p>
    </div>
  )
}
