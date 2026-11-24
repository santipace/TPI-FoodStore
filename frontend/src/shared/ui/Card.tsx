import type { HTMLAttributes } from 'react'

export function Card({ className = '', children, ...resto }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-xl border border-line bg-white ${className}`} {...resto}>
      {children}
    </div>
  )
}
