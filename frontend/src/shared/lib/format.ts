const moneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 })
const fecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' })

export function formatearPrecio(valor: number): string {
  return moneda.format(valor)
}

/** El backend guarda fechas UTC sin zona horaria: se les agrega 'Z' para mostrarlas en hora local. */
export function formatearFecha(iso: string): string {
  const conZona = /[zZ]|[+-]\d{2}:\d{2}$/.test(iso) ? iso : `${iso}Z`
  return fecha.format(new Date(conZona))
}
