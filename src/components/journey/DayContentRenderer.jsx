import Input from '../../design-system/Input'
import Card from '../../design-system/Card'
import DayAnswerField from './DayAnswerField'
import Button from '../../design-system/Button'
import { cn } from '../../lib/utils'

function ListField({ section, answers, onChange, readOnly, fieldVariant = 'default' }) {
  const listId = section.listId
  const items = answers[listId] || Array.from({ length: section.minItems || 3 }, () => '')
  const max = section.maxItems || 10

  const updateItem = (index, value) => {
    const next = [...items]
    next[index] = value
    onChange(listId, next)
  }

  const addItem = () => {
    if (items.length < max) onChange(listId, [...items, ''])
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <Input
          key={i}
          variant={fieldVariant}
          label={`Item ${i + 1}`}
          value={item}
          onChange={(e) => updateItem(i, e.target.value)}
          disabled={readOnly}
          placeholder={`${i + 1}...`}
        />
      ))}
      {!readOnly && items.length < max && (
        <Button type="button" variant="secondary" size="sm" onClick={addItem}>
          + Adicionar item
        </Button>
      )}
    </div>
  )
}

function containsJejum(...texts) {
  return texts.some((text) => text && /jejum/i.test(text))
}

function isAccentCard(section) {
  const title = section.title || ''
  return title.includes('Exercício de hoje') || title.includes('Ação do dia')
}

function isJejumSection(section) {
  return containsJejum(section.title, section.body, section.instructions, section.text)
}

function getSectionVariant(section) {
  if (section.type === 'declaration') return 'dark'
  if (isAccentCard(section)) return 'accent'
  if (isJejumSection(section)) return 'fasting'
  if (section.type === 'reading') return 'glass'
  return 'light'
}

function getHeadingClass(variant) {
  if (variant === 'light') return 'font-serif text-xl text-beige md:text-2xl'
  return 'font-serif text-xl text-stone-900'
}

function getBodyTextClass(variant) {
  if (variant === 'light') return 'text-stone-300'
  if (variant === 'accent' || variant === 'fasting' || variant === 'glass') return 'text-stone-800'
  return 'text-stone-600'
}

function getFieldVariant(cardVariant) {
  return cardVariant === 'light' ? 'gradient' : 'default'
}

function SectionBlock({ section, answers, onChange, readOnly }) {
  const variant = getSectionVariant(section)
  const fieldVariant = getFieldVariant(variant)

  switch (section.type) {
    case 'reading':
      return (
        <Card variant={variant}>
          <h3 className={getHeadingClass(variant)}>{section.title}</h3>
          <p className={cn('mt-3 whitespace-pre-wrap leading-relaxed', getBodyTextClass(variant))}>
            {section.body}
          </p>
        </Card>
      )

    case 'exercise':
      return (
        <Card variant={variant}>
          <h3 className={getHeadingClass(variant)}>{section.title}</h3>
          {section.instructions && (
            <p className={cn('mt-2 leading-relaxed', getBodyTextClass(variant))}>
              {section.instructions}
            </p>
          )}
          <div className="mt-4 space-y-4">
            {section.fields?.map((field) => (
              <DayAnswerField
                key={field.id}
                fieldId={field.id}
                kind={field.kind}
                variant={fieldVariant}
                label={field.label}
                placeholder={field.placeholder}
                value={answers[field.id] || ''}
                onChange={onChange}
                readOnly={readOnly}
              />
            ))}
          </div>
        </Card>
      )

    case 'questions':
      return (
        <Card variant={variant}>
          <h3 className={getHeadingClass(variant)}>{section.title}</h3>
          <div className="mt-4 space-y-4">
            {section.items?.map((item) => (
              <DayAnswerField
                key={item.id}
                fieldId={item.id}
                kind={item.kind}
                variant={fieldVariant}
                label={item.label}
                placeholder={item.placeholder}
                value={answers[item.id] || ''}
                onChange={onChange}
                readOnly={readOnly}
              />
            ))}
          </div>
        </Card>
      )

    case 'list':
      return (
        <Card variant={variant}>
          <h3 className={getHeadingClass(variant)}>{section.title}</h3>
          {section.instructions && (
            <p className={cn('mt-2', getBodyTextClass(variant))}>{section.instructions}</p>
          )}
          <div className="mt-4">
            <ListField
              section={section}
              answers={answers}
              onChange={onChange}
              readOnly={readOnly}
              fieldVariant={fieldVariant}
            />
          </div>
        </Card>
      )

    case 'declaration':
      return (
        <Card variant="dark" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-stone-800/50 to-transparent" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
              Declaração do dia
            </p>
            <p className="mt-3 font-serif text-2xl leading-snug text-pale-yellow md:text-3xl">
              "{section.text}"
            </p>
          </div>
        </Card>
      )

    default:
      return null
  }
}

export default function DayContentRenderer({ day, answers, onAnswerChange, readOnly = false }) {
  const handleChange = (fieldId, value) => {
    if (readOnly) return
    onAnswerChange(fieldId, value)
  }

  const introHasJejum = containsJejum(day.intro)

  return (
    <div className="space-y-6">
      {day.intro &&
        (introHasJejum ? (
          <Card variant="fasting">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
              Jejum da semana
            </p>
            <p className="mt-2 text-lg leading-relaxed text-stone-800">{day.intro}</p>
          </Card>
        ) : (
          <p className="text-lg leading-relaxed text-stone-300">{day.intro}</p>
        ))}
      {day.sections.map((section, i) => (
        <SectionBlock
          key={`${section.type}-${section.title}-${i}`}
          section={section}
          answers={answers}
          onChange={handleChange}
          readOnly={readOnly}
        />
      ))}
    </div>
  )
}
