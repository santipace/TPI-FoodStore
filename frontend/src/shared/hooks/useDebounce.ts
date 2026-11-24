import { useEffect, useState } from 'react'

/** Devuelve el valor recien despues de que dejo de cambiar durante `demora` milisegundos. */
export function useDebounce<T>(valor: T, demora = 350): T {
  const [valorDemorado, setValorDemorado] = useState(valor)
  useEffect(() => {
    const id = setTimeout(() => setValorDemorado(valor), demora)
    return () => clearTimeout(id)
  }, [valor, demora])
  return valorDemorado
}
