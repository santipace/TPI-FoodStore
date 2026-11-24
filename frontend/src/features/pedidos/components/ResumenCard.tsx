import { Card } from '../../../shared/ui/Card'

interface ResumenCardProps {
  titulo: string
  valor: string | number
  nota?: string
}

export function ResumenCard({ titulo, valor, nota }: ResumenCardProps) {
  return (
    <Card className="p-5">
      <p className="font-semibold text-ink/70">{titulo}</p>
      <p className="mt-1 font-display text-4xl font-bold">{valor}</p>
      {nota && <p className="mt-1 text-sm text-ink/60">{nota}</p>}
    </Card>
  )
}
