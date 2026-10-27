import { useCallback, useState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { useMural } from '../../contexts/MuralContext'
import { MURAL_COLORS, CARD_FONTS } from '../../data/weeks'
import MuralCard from './MuralCard'
import MuralPresenceBanner from './MuralPresenceBanner'
import WeeklyGoalsPanel from './WeeklyGoalsPanel'
import Button from '../../design-system/Button'
import Badge from '../../design-system/Badge'

function normalizeColor(color) {
  return (color ?? '').toLowerCase()
}

export default function MuralBoard() {
  const { cards, addCard, updateCard, removeCard } = useMural()
  const [editingId, setEditingId] = useState(null)
  const [draftById, setDraftById] = useState({})
  const [selectedCardId, setSelectedCardId] = useState(null)
  const [newCardColor, setNewCardColor] = useState(MURAL_COLORS[0])

  const startEdit = useCallback(
    (id) => {
      const card = cards.find((c) => c.id === id)
      if (!card) return
      setEditingId(id)
      setDraftById((prev) => {
        if (prev[id] !== undefined) return prev
        return {
          ...prev,
          [id]: {
            title: typeof card.title === 'string' ? card.title : '',
            text: card.text ?? '',
          },
        }
      })
    },
    [cards],
  )

  const setDraft = useCallback((id, patch) => {
    setDraftById((prev) => {
      const current = prev[id] ?? { title: '', text: '' }
      return { ...prev, [id]: { ...current, ...patch } }
    })
  }, [])

  const commitEdit = useCallback(
    async (id) => {
      const draft = draftById[id]
      const card = cards.find((c) => c.id === id)
      if (draft !== undefined && card) {
        const nextTitle = draft.title ?? ''
        const nextText = draft.text ?? ''
        const currentTitle = typeof card.title === 'string' ? card.title : ''
        const updates = {}
        if (nextTitle !== currentTitle) updates.title = nextTitle
        if (nextText !== card.text) updates.text = nextText
        if (Object.keys(updates).length > 0) {
          await updateCard(id, updates)
        }
      }
      setEditingId((current) => (current === id ? null : current))
      setDraftById((prev) => {
        if (!(id in prev)) return prev
        const next = { ...prev }
        delete next[id]
        return next
      })
    },
    [cards, draftById, updateCard],
  )

  const cancelEdit = useCallback((id) => {
    setEditingId((current) => (current === id ? null : current))
    setDraftById((prev) => {
      if (!(id in prev)) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? null
  const activeColor = selectedCard?.color ?? newCardColor

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragEnd = (event) => {
    const { active, delta } = event
    const card = cards.find((c) => c.id === active.id)
    if (card) {
      setSelectedCardId(card.id)
      updateCard(card.id, { x: card.x + delta.x, y: card.y + delta.y })
    }
  }

  const handleColorPick = (color) => {
    if (selectedCardId) {
      updateCard(selectedCardId, { color })
      return
    }
    setNewCardColor(color)
  }

  const handleCanvasPointerDown = (event) => {
    if (event.target === event.currentTarget) {
      setSelectedCardId(null)
    }
  }

  return (
    <div className="flex min-h-full w-full flex-col px-3 py-3 md:h-dvh md:min-h-0 md:overflow-hidden md:px-4 md:py-3">
      <div className="mb-2 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="font-serif text-3xl font-light tracking-tight text-stone-900 md:text-4xl">
            Mural
          </h1>
          <Badge pulse className="hidden sm:inline-flex">
            <span>Seu mural de manifestação</span>
          </Badge>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <Button
            variant="primary"
            size="sm"
            aria-label="Novo card"
            title="Novo card"
            className="!h-9 !w-9 !gap-0 !rounded-full !p-0 text-lg leading-none"
            onClick={async () => {
              const card = await addCard('Nova afirmação', '')
              const color = selectedCard?.color ?? newCardColor
              await updateCard(card.id, { color })
              setSelectedCardId(card.id)
            }}
          >
            +
          </Button>

          <div className="flex items-center gap-1.5">
            {MURAL_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                title={selectedCardId ? 'Alterar cor do card' : 'Cor para o próximo card'}
                className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-105 ${
                  normalizeColor(activeColor) === normalizeColor(color)
                    ? 'border-stone-900 ring-2 ring-stone-900/20'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorPick(color)}
              />
            ))}
          </div>

          {CARD_FONTS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`rounded-full border px-2.5 py-1 text-xs ${
                selectedCard?.fontSize === f.value
                  ? 'border-stone-900 bg-stone-900/5'
                  : 'border-stone-300'
              }`}
              onClick={() => {
                if (selectedCardId) updateCard(selectedCardId, { fontSize: f.value })
              }}
              disabled={!selectedCardId}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <MuralPresenceBanner />

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden md:flex-row">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <motion.div
            className="relative min-h-[320px] min-w-0 flex-1 overflow-auto rounded-3xl border border-stone-300/40 bg-gradient-to-br from-beige-light via-beige to-sage/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onPointerDown={handleCanvasPointerDown}
          >
            {cards.map((card) => (
              <MuralCard
                key={card.id}
                card={card}
                isSelected={selectedCardId === card.id}
                onSelect={setSelectedCardId}
                onUpdate={updateCard}
                onDelete={(id) => {
                  removeCard(id)
                  if (selectedCardId === id) setSelectedCardId(null)
                  if (editingId === id) cancelEdit(id)
                }}
                isEditing={editingId === card.id}
                draftTitle={draftById[card.id]?.title ?? card.title ?? ''}
                draftText={draftById[card.id]?.text ?? card.text}
                onDraftChange={(patch) => setDraft(card.id, patch)}
                onStartEdit={() => startEdit(card.id)}
                onCommitEdit={() => commitEdit(card.id)}
                onCancelEdit={() => cancelEdit(card.id)}
              />
            ))}
            {cards.length === 0 && (
              <p className="absolute inset-0 flex items-center justify-center text-stone-500">
                Crie seu primeiro card de afirmação
              </p>
            )}
          </motion.div>
        </DndContext>

        <div className="flex min-h-[280px] w-full shrink-0 md:h-full md:w-52 md:min-h-0">
          <WeeklyGoalsPanel />
        </div>
      </div>
    </div>
  )
}
