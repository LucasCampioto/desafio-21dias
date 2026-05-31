import { useState } from 'react'
import { Icon } from '@iconify/react'
import Card from '../../design-system/Card'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

export default function MuralPresenceSettings() {
  const { user, updateProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const enabled = user?.muralPresenceEnabled !== false

  const handleToggle = async () => {
    setMessage('')
    setSaving(true)

    try {
      const next = !enabled
      await updateProfile({ muralPresenceEnabled: next })
      setMessage(next ? 'Lembretes no mural ativados.' : 'Lembretes no mural desativados.')
    } catch {
      setMessage('Não foi possível salvar a preferência. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card variant="panel">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900/5">
          <Icon icon="solar:heart-pulse-linear" width={22} className="text-stone-700" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-xl text-stone-900">Lembretes no mural</h3>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            Três vezes ao dia, um banner breve aparece aqui no mural — com suas próprias palavras da
            jornada. Independente das notificações do navegador.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-stone-800">Mostrar lembretes no mural</p>
          <p className="text-xs text-stone-500">Manhã, tarde e noite — cerca de 1 hora cada</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={saving}
          onClick={handleToggle}
          className={cn(
            'inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 disabled:opacity-50',
            enabled ? 'bg-lime' : 'bg-stone-300',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ease-in-out',
              enabled ? 'translate-x-5' : 'translate-x-0',
            )}
          />
        </button>
      </div>

      {message && <p className="mt-4 text-sm text-stone-700">{message}</p>}
    </Card>
  )
}
