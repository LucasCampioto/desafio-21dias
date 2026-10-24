import { useCallback, useState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { useMural } from '../../contexts/MuralContext'
import { MURAL_COLORS, CARD_FONTS } from '../../data/weeks'
import MuralCard from './MuralCard'
import MuralPresenceBanner from './MuralPresenceBanner'
import WeeklyGoalsPanel from './WeeklyGoalsPanel'
import Button from '../../design-system/Button'
import PageHeader from '../../design-system/PageHeader'
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
        return { ...prev, [id]: card.text }
      })
    },
    [cards],
  )

  const setDraft = useCallback((id, text) => {
    setDraftById((prev) => ({ ...prev, [id]: text }))
  }, [])

  const commitEdit = useCallback(
    async (id) => {
      const draft = draftById[id]
      const card = cards.find((c) => c.id === id)
      if (draft !== undefined && card && draft !== card.text) {
        await updateCard(id, { text: draft })
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
    <div className="flex min-h-full w-full flex-col px-4 py-4 md:h-dvh md:min-h-0 md:overflow-hidden md:px-5 md:py-5">
      <PageHeader
        compact
        badge={
          <Badge pulse>
            <span>Seu mural de manifestação</span>
          </Badge>
        }
        title="Mural"
        subtitle="Crie afirmações, organize pensamentos e mantenha sua visão viva."
      />

      <MuralPresenceBanner />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="mb-3 flex shrink-0 flex-wrap items-center gap-3">
        <Button
          variant="primary"
          size="sm"
          onClick={async () => {
            const card = await addCard('Nova afirmação')
            const color = selectedCard?.color ?? newCardColor
            await updateCard(card.id, { color })
            setSelectedCardId(card.id)
          }}
        >
          + Novo card
        </Button>

        <div className="flex items-center gap-2">
          {selectedCard && (
            <span className="text-xs text-stone-500">Cor do card selecionado</span>
          )}
          {MURAL_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              title={selectedCardId ? 'Alterar cor do card' : 'Cor para o próximo card'}
              className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-105 ${
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
            className={`rounded-full border px-3 py-1 text-xs ${
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

        <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row">
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <motion.div
              className="relative min-h-[280px] min-w-0 flex-1 overflow-auto rounded-3xl border border-stone-300/40 bg-gradient-to-br from-beige-light via-beige to-sage/20"
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
                  draftText={draftById[card.id] ?? card.text}
                  onDraftChange={(text) => setDraft(card.id, text)}
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

          <div className="flex w-full shrink-0 md:h-full md:w-60 md:min-h-0">
            <WeeklyGoalsPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
