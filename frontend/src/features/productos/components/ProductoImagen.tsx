import { useState } from 'react'

interface ProductoImagenProps {
  nombre: string
  imagenUrl: string | null
  className?: string
}

/** Tono estable (0-359) derivado del nombre, para colorear el placeholder de cada producto. */
function tonoDe(texto: string): number {
  let hash = 0
  for (const caracter of texto) hash = (hash * 31 + caracter.charCodeAt(0)) % 360
  return hash
}

export function ProductoImagen({ nombre, imagenUrl, className = '' }: ProductoImagenProps) {
  const [fallo, setFallo] = useState(false)

  if (imagenUrl && !fallo) {
    return (
      <img
        src={imagenUrl}
        alt={nombre}
        loading="lazy"
        onError={() => setFallo(true)}
        className={`object-cover ${className}`}
      />
    )
  }

  const tono = tonoDe(nombre)
  return (
    <div
      role="img"
      aria-label={nombre}
      className={`flex items-center justify-center font-display text-5xl font-bold ${className}`}
      style={{ backgroundColor: `hsl(${tono} 45% 88%)`, color: `hsl(${tono} 55% 28%)` }}
    >
      {nombre.trim().charAt(0).toUpperCase()}
    </div>
  )
}
