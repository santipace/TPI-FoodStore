import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface CampoProps {
  label: string
  error?: string
  ayuda?: string
}

const BASE =
  'w-full rounded-lg border bg-white px-3 py-2 text-base text-ink placeholder:text-ink/40 focus:border-brand-600 disabled:bg-paper'

function claseBorde(error?: string): string {
  return error ? 'border-chile' : 'border-line'
}

function Etiqueta({ id, label, error, ayuda }: CampoProps & { id: string }) {
  return (
    <>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {label}
      </label>
      {ayuda && !error && <p className="mb-1 text-sm text-ink/60">{ayuda}</p>}
      {error && (
        <p role="alert" className="mb-1 text-sm text-chile">
          {error}
        </p>
      )}
    </>
  )
}

export function Input({
  label,
  error,
  ayuda,
  id,
  className = '',
  ...resto
}: CampoProps & InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id ?? `campo-${label}`
  return (
    <div className={className}>
      <Etiqueta id={inputId} label={label} error={error} ayuda={ayuda} />
      <input id={inputId} aria-invalid={error ? true : undefined} className={`${BASE} ${claseBorde(error)}`} {...resto} />
    </div>
  )
}

export function Select({
  label,
  error,
  ayuda,
  id,
  className = '',
  children,
  ...resto
}: CampoProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const selectId = id ?? `campo-${label}`
  return (
    <div className={className}>
      <Etiqueta id={selectId} label={label} error={error} ayuda={ayuda} />
      <select id={selectId} aria-invalid={error ? true : undefined} className={`${BASE} ${claseBorde(error)}`} {...resto}>
        {children}
      </select>
    </div>
  )
}

export function Textarea({
  label,
  error,
  ayuda,
  id,
  className = '',
  ...resto
}: CampoProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const areaId = id ?? `campo-${label}`
  return (
    <div className={className}>
      <Etiqueta id={areaId} label={label} error={error} ayuda={ayuda} />
      <textarea
        id={areaId}
        rows={3}
        aria-invalid={error ? true : undefined}
        className={`${BASE} ${claseBorde(error)}`}
        {...resto}
      />
    </div>
  )
}
