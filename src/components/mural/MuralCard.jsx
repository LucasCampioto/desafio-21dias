import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Icon } from '@iconify/react'

const DEFAULT_WIDTH = 192
const DEFAULT_HEIGHT = 140
const MIN_WIDTH = 120
const MIN_HEIGHT = 100
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
  draftTitle,
  draftText,
  onDraftChange,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  isSelected,
  onSelect,
}) {
  const cardRef = useRef(null)
  const titleRef = useRef(null)
  const textareaRef = useRef(null)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    disabled: isEditing,
  })

  const width = card.width ?? DEFAULT_WIDTH
  const height = card.height ?? DEFAULT_HEIGHT

  const [liveSize, setLiveSize] = useState({ width, height })
  const resizingRef = useRef(false)

  const setRefs = useCallback(
    (node) => {
      cardRef.current = node
      setNodeRef(node)
    },
    [setNodeRef],
  )

  useEffect(() => {
    if (!resizingRef.current) {
      setLiveSize({ width, height })
    }
  }, [width, height])

  useLayoutEffect(() => {
    if (!isEditing || !titleRef.current) return
    const input = titleRef.current
    input.focus()
    const end = input.value.length
    input.setSelectionRange(end, end)
  }, [isEditing])

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

  const handleStartEdit = useCallback(
    (event) => {
      event?.stopPropagation?.()
      onSelect?.(card.id)
      onStartEdit()
    },
    [card.id, onSelect, onStartEdit],
  )

  const handleFieldBlur = useCallback(() => {
    requestAnimationFrame(() => {
      if (!cardRef.current?.contains(document.activeElement)) {
        onCommitEdit()
      }
    })
  }, [onCommitEdit])

  const title = typeof card.title === 'string' ? card.title : ''

  return (
    <div
      ref={setRefs}
      style={style}
      className={`absolute flex flex-col rounded-xl p-4 shadow-lg transition-shadow ${
        isEditing
          ? 'z-30 cursor-text'
          : isDragging
            ? 'z-50 cursor-grabbing shadow-2xl'
            : isSelected
              ? 'z-20 cursor-grab ring-2 ring-stone-900 ring-offset-2'
              : 'z-10 cursor-grab'
      } active:cursor-grabbing`}
      onClick={() => {
        if (!isEditing) onSelect?.(card.id)
      }}
      {...(isEditing ? {} : listeners)}
      {...(isEditing ? {} : attributes)}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {isEditing ? (
          <>
            <input
              ref={titleRef}
              className="mb-1 w-full shrink-0 bg-transparent font-serif text-[1.05em] font-bold leading-tight text-stone-900 outline-none placeholder:text-stone-900/35"
              value={draftTitle}
              placeholder="Título"
              onChange={(e) => onDraftChange({ title: e.target.value })}
              onBlur={handleFieldBlur}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault()
                  onCancelEdit()
                }
                if (e.key === 'Enter') {
                  e.preventDefault()
                  textareaRef.current?.focus()
                }
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
            <textarea
              ref={textareaRef}
              className="min-h-0 w-full flex-1 resize-none bg-transparent font-medium leading-snug text-stone-900 outline-none placeholder:text-stone-900/35"
              value={draftText}
              placeholder="Afirmação"
              onChange={(e) => onDraftChange({ text: e.target.value })}
              onBlur={handleFieldBlur}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault()
                  onCancelEdit()
                }
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
          </>
        ) : (
          <div className="h-full overflow-auto" onDoubleClick={handleStartEdit}>
            {title ? (
              <p className="mb-1 font-serif text-[1.05em] font-bold leading-tight text-stone-900">
                {title}
              </p>
            ) : null}
            <p className="font-medium leading-snug text-stone-900">{card.text}</p>
          </div>
        )}
      </div>

      <div className="mt-3 flex shrink-0 gap-2">
        <button
          type="button"
          className="rounded-full bg-stone-900/10 p-1"
          onMouseDown={(e) => e.preventDefault()}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleStartEdit}
        >
          <Icon icon="solar:pen-linear" width={14} />
        </button>
        <button
          type="button"
          className="rounded-full bg-stone-900/10 p-1"
          onMouseDown={(e) => e.preventDefault()}
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
