import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import * as goalsController from '../../controllers/goalsController'
import { cn } from '../../lib/utils'

const KIND_OPTIONS = [
  { id: 'do', label: 'Tarefa' },
  { id: 'avoid', label: 'Não fazer' },
]

function GoalRow({ goal, pending, editing, onStartEdit, onSave, onCancel, onToggle, onDelete }) {
  const [draft, setDraft] = useState(goal.text)
  const committing = useRef(false)

  useEffect(() => {
    if (editing) {
      setDraft(goal.text)
      committing.current = false
    }
  }, [editing, goal.text])

  const commit = () => {
    if (committing.current) return
    committing.current = true
    onSave(goal, draft)
  }

  return (
    <li className="flex items-start gap-2 py-1.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={goal.done}
        aria-label={goal.done ? `Desmarcar ${goal.text}` : `Concluir ${goal.text}`}
        disabled={pending || editing}
        onClick={() => onToggle(goal)}
        className={cn(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
          goal.done ? 'border-stone-900 bg-stone-900 text-beige' : 'border-stone-400 bg-white',
          pending && 'opacity-50',
        )}
      >
        {goal.done && <Icon icon="solar:check-read-linear" width={10} />}
      </button>
      {editing ? (
        <input
          autoFocus
          value={draft}
          maxLength={160}
          aria-label="Editar meta"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              event.currentTarget.blur()
            }
            if (event.key === 'Escape') {
              committing.current = true
              onCancel()
            }
          }}
          className="min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-2 py-0.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
        />
      ) : (
        <button
          type="button"
          onClick={() => onStartEdit(goal.id)}
          className={cn(
            'min-w-0 flex-1 text-left text-sm leading-snug text-stone-800',
            goal.done && 'text-stone-400 line-through',
          )}
        >
          {goal.text}
        </button>
      )}
      {!editing && (
        <button
          type="button"
          aria-label={`Editar ${goal.text}`}
          onClick={() => onStartEdit(goal.id)}
          className="shrink-0 text-stone-300 transition-colors hover:text-stone-600"
        >
          <Icon icon="solar:pen-linear" width={14} />
        </button>
      )}
      <button
        type="button"
        aria-label={`Remover ${goal.text}`}
        onClick={() => onDelete(goal.id)}
        className="shrink-0 text-stone-300 transition-colors hover:text-stone-600"
      >
        <Icon icon="solar:close-circle-linear" width={16} />
      </button>
    </li>
  )
}

export default function WeeklyGoalsPanel() {
  const [goals, setGoals] = useState([])
  const [kind, setKind] = useState('do')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pendingId, setPendingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setGoals(await goalsController.loadGoals())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar as metas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const visibleGoals = goals.filter((goal) => goal.kind === kind)
  const doneCount = visibleGoals.filter((goal) => goal.done).length
  const percent = visibleGoals.length === 0 ? 0 : Math.round((doneCount / visibleGoals.length) * 100)

  const handleAdd = async (event) => {
    event.preventDefault()
    const nextText = text.trim()
    if (!nextText || saving) return

    setSaving(true)
    setError(null)
    try {
      const goal = await goalsController.createGoal({ text: nextText, kind })
      setGoals((current) => [...current, goal])
      setText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível adicionar a meta.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (goal) => {
    const nextDone = !goal.done
    setPendingId(goal.id)
    setGoals((current) =>
      current.map((item) => (item.id === goal.id ? { ...item, done: nextDone } : item)),
    )

    try {
      const updated = await goalsController.setGoalDone(goal.id, nextDone)
      setGoals((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    } catch (err) {
      setGoals((current) =>
        current.map((item) => (item.id === goal.id ? { ...item, done: goal.done } : item)),
      )
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar a meta.')
    } finally {
      setPendingId(null)
    }
  }

  const handleSaveText = async (goal, draft) => {
    const nextText = draft.trim()
    setEditingId(null)
    if (!nextText || nextText === goal.text) return

    setGoals((current) =>
      current.map((item) => (item.id === goal.id ? { ...item, text: nextText } : item)),
    )

    try {
      const updated = await goalsController.updateGoalText(goal.id, nextText)
      setGoals((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    } catch (err) {
      setGoals((current) =>
        current.map((item) => (item.id === goal.id ? { ...item, text: goal.text } : item)),
      )
      setError(err instanceof Error ? err.message : 'Não foi possível editar a meta.')
    }
  }

  const handleDelete = async (id) => {
    const previous = goals
    setGoals((current) => current.filter((goal) => goal.id !== id))
    try {
      await goalsController.deleteGoal(id)
    } catch (err) {
      setGoals(previous)
      setError(err instanceof Error ? err.message : 'Não foi possível remover a meta.')
    }
  }

  return (
    <section className="flex h-full min-h-0 w-full flex-col rounded-2xl border border-stone-300/40 bg-white/45 p-3 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-serif text-lg font-light text-stone-900">Metas</h2>
        <p className="text-xs tabular-nums text-stone-500">
          {doneCount}/{visibleGoals.length}
        </p>
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-stone-900/10">
        <div className="h-full rounded-full bg-lime" style={{ width: `${percent}%` }} />
      </div>

      <form onSubmit={handleAdd} className="mt-3 shrink-0">
        <div className="mb-2 grid grid-cols-2 gap-1">
          {KIND_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={kind === option.id}
              onClick={() => setKind(option.id)}
              className={cn(
                'rounded-full px-2 py-1 text-xs',
                kind === option.id ? 'bg-stone-900 text-beige' : 'text-stone-500 hover:bg-white/80',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={160}
            placeholder={kind === 'do' ? 'Nova tarefa' : 'Não vou fazer'}
            className="min-w-0 flex-1 rounded-full border border-stone-300/80 bg-white/80 px-3 py-1.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
          />
          <button
            type="submit"
            aria-label="Incluir meta"
            disabled={saving || !text.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-900 text-beige disabled:opacity-40"
          >
            <Icon icon="solar:add-circle-linear" width={18} />
          </button>
        </div>
      </form>

      {error && <p className="mt-2 text-xs text-stone-600">{error}</p>}

      <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <p className="py-2 text-xs text-stone-400">Carregando...</p>
        ) : (
          <>
            {visibleGoals.length > 0 && (
              <ul>
                {visibleGoals.map((goal) => (
                    <GoalRow
                    key={goal.id}
                    goal={goal}
                    pending={pendingId === goal.id}
                    editing={editingId === goal.id}
                    onStartEdit={setEditingId}
                    onSave={handleSaveText}
                    onCancel={() => setEditingId(null)}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  )
}
