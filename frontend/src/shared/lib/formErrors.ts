interface MetaDeCampo {
  isTouched: boolean
  errors: ReadonlyArray<unknown>
}

/** Mensaje de error de un campo de TanStack Form; solo se muestra cuando el campo fue tocado. */
export function mensajeError(meta: MetaDeCampo): string | undefined {
  if (!meta.isTouched) return undefined
  const primero = meta.errors.find((e): e is string => typeof e === 'string' && e.length > 0)
  return primero
}
