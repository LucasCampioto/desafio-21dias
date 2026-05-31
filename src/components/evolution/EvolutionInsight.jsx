import Card from '../../design-system/Card'

export default function EvolutionInsight({ title, body }) {
  return (
    <Card variant="panel">
      <h3 className="font-serif text-xl text-stone-900">{title}</h3>
      <p className="mt-3 whitespace-pre-wrap leading-relaxed text-stone-600">{body}</p>
    </Card>
  )
}
