import { useCallback, useEffect, useRef, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Icon } from '@iconify/react'

const DEFAULT_WIDTH = 192
const DEFAULT_HEIGHT = 120
const MIN_WIDTH = 120
const MIN_HEIGHT = 80
const MAX_WIDTH = 480
const MAX_HEIGHT = 400

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export default function MuralCard({
  card,
  onUpdate,
  onDelete,
  isEditing,
  setEditingId,
  isSelected,
  onSelect,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
  })

  const width = card.width ?? DEFAULT_WIDTH
  const height = card.height ?? DEFAULT_HEIGHT

  const [liveSize, setLiveSize] = useState({ width, height })
  const [draftText, setDraftText] = useState(card.text)
  const resizingRef = useRef(false)

  useEffect(() => {
    if (!resizingRef.current) {
      setLiveSize({ width, height })
    }
  }, [width, height])

  useEffect(() => {
    if (isEditing) {
      setDraftText(card.text)
    }
  }, [isEditing, card.id])

  const commitTextEdit = useCallback(() => {
    if (draftText !== card.text) {
      onUpdate(card.id, { text: draftText })
    }
    setEditingId(null)
  }, [card.id, card.text, draftText, onUpdate, setEditingId])

  const style = {
    transform: CSS.Translate.toString(transform),
    left: card.x,
    top: card.y,
    width: liveSize.width,
    height: liveSize.height,
    backgroundColor: card.color,
    fontSize: card.fontSize,
  }

  const handleResizePointerDown = useCallback(
    (event) => {
      event.stopPropagation()
      event.preventDefault()

      resizingRef.current = true
      const startX = event.clientX
      const startY = event.clientY
      const startW = liveSize.width
      const startH = liveSize.height

      const onMove = (moveEvent) => {
        const nextW = clamp(startW + moveEvent.clientX - startX, MIN_WIDTH, MAX_WIDTH)
        const nextH = clamp(startH + moveEvent.clientY - startY, MIN_HEIGHT, MAX_HEIGHT)
        setLiveSize({ width: nextW, height: nextH })
      }

      const onUp = (upEvent) => {
        document.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerup', onUp)
        resizingRef.current = false

        const finalW = clamp(startW + upEvent.clientX - startX, MIN_WIDTH, MAX_WIDTH)
        const finalH = clamp(startH + upEvent.clientY - startY, MIN_HEIGHT, MAX_HEIGHT)
        setLiveSize({ width: finalW, height: finalH })
        onUpdate(card.id, { width: finalW, height: finalH })
      }

      document.addEventListener('pointermove', onMove)
      document.addEventListener('pointerup', onUp)
    },
    [card.id, liveSize.height, liveSize.width, onUpdate],
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`absolute flex cursor-grab flex-col rounded-xl p-4 shadow-lg transition-shadow active:cursor-grabbing ${
        isDragging ? 'z-50 shadow-2xl' : isSelected ? 'z-20 ring-2 ring-stone-900 ring-offset-2' : 'z-10'
      }`}
      onClick={() => onSelect?.(card.id)}
      {...listeners}
      {...attributes}
    >
      <div className="min-h-0 flex-1 overflow-hidden">
        {isEditing ? (
          <textarea
            className="h-full w-full resize-none bg-transparent font-medium leading-snug text-stone-900 outline-none"
            value={draftText}
            autoFocus
            onChange={(e) => setDraftText(e.target.value)}
            onBlur={commitTextEdit}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setDraftText(card.text)
                setEditingId(null)
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
          />
        ) : (
          <p
            className="h-full overflow-auto font-medium leading-snug text-stone-900"
            onDoubleClick={() => {
              onSelect?.(card.id)
              setEditingId(card.id)
            }}
          >
            {card.text}
          </p>
        )}
      </div>

      <div className="mt-3 flex shrink-0 gap-2">
        <button
          type="button"
          className="rounded-full bg-stone-900/10 p-1"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.(card.id)
            setEditingId(card.id)
          }}
        >
          <Icon icon="solar:pen-linear" width={14} />
        </button>
        <button
          type="button"
          className="rounded-full bg-stone-900/10 p-1"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onDelete(card.id)
          }}
        >
          <Icon icon="solar:trash-bin-minimalistic-linear" width={14} />
        </button>
      </div>

      <button
        type="button"
        aria-label="Redimensionar card"
        className="absolute bottom-1 right-1 cursor-se-resize rounded-md p-1 text-stone-900/40 transition-colors hover:bg-stone-900/10 hover:text-stone-900/70"
        onPointerDown={handleResizePointerDown}
      >
        <Icon icon="solar:maximize-square-linear" width={16} className="rotate-90" />
      </button>
    </div>
  )
}
