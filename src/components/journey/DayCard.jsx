import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { cn } from '../../lib/utils'

function getLockedLabel(dayId, currentDay) {
  if (dayId === currentDay + 1) return 'Abre amanhã.'
  const diff = dayId - currentDay
  if (diff > 1) return `Abre em ${diff} dias.`
  return 'Bloqueado.'
}

function TimelineNode({ status, dayId }) {
  if (status === 'active') {
    return (
      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lime text-base font-semibold text-stone-900 shadow-lg shadow-lime/30 ring-4 ring-lime/20">
        {dayId}
      </div>
    )
  }

  if (status === 'completed') {
    return (
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-green-600/50 bg-green-950/60 text-green-500">
        <Icon icon="solar:check-circle-bold" width={22} />
      </div>
    )
  }

  if (status === 'available') {
    return (
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-500/50 bg-stone-800/90 text-sm font-medium text-stone-300">
        {dayId}
      </div>
    )
  }

  return (
    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-600/50 bg-stone-800/80 text-stone-500">
      <Icon icon="solar:lock-linear" width={18} />
    </div>
  )
}

export default function DayCard({ day, status, currentDay, sessionId, isLast }) {
  const accessible = status !== 'locked'

  const card = (
    <div
      className={cn(
        'relative flex-1 rounded-2xl border px-5 py-4 transition-all duration-300 md:px-6 md:py-5',
        status === 'active' &&
          'border-lime/30 bg-stone-900/90 shadow-xl shadow-lime/5 ring-1 ring-lime/20 backdrop-blur-md',
        status === 'completed' &&
          'border-green-600/20 bg-stone-900/70 backdrop-blur-md hover:border-green-600/40',
        status === 'available' &&
          'border-stone-600/40 bg-stone-900/75 backdrop-blur-md hover:border-stone-500/50',
        status === 'locked' &&
          'border-stone-700/40 bg-stone-900/40 opacity-70 backdrop-blur-sm',
        accessible && status !== 'locked' && 'hover:translate-x-0.5',
      )}
    >
      {status === 'active' && (
        <div className="absolute -right-1 -top-3 flex items-center gap-1 rounded-full bg-pale-pink px-3 py-1 text-xs font-medium text-stone-900 shadow-md">
          <Icon icon="solar:star-fall-linear" width={14} />
          hoje
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-[11px] font-semibold uppercase tracking-[0.15em]',
              status === 'locked' ? 'text-stone-600' : 'text-stone-400',
            )}
          >
            Dia {day.id}
          </p>
          <h4
            className={cn(
              'mt-1 font-serif text-xl leading-tight md:text-2xl',
              status === 'locked' ? 'text-stone-500' : 'text-beige',
            )}
          >
            {day.title}
          </h4>
          <p
            className={cn(
              'mt-2 text-sm leading-relaxed',
              status === 'locked' ? 'text-stone-600' : 'text-stone-400',
            )}
          >
            {status === 'locked' ? getLockedLabel(day.id, currentDay) : day.focus}
          </p>
        </div>

        {status === 'locked' && (
          <Icon icon="solar:lock-linear" width={20} className="mt-1 shrink-0 text-stone-600" />
        )}
        {status === 'completed' && (
          <Icon icon="solar:check-read-linear" width={20} className="mt-1 shrink-0 text-green-500" />
        )}
      </div>
    </div>
  )

  return (
    <div className={cn('relative flex gap-4 md:gap-6', !isLast && 'pb-8')}>
      <div className="flex flex-col items-center">
        <TimelineNode status={status} dayId={day.id} />
        {!isLast && (
          <div className="mt-2 w-px flex-1 min-h-[2rem] bg-gradient-to-b from-stone-600/50 to-stone-700/30" />
        )}
      </div>

      {accessible ? (
        <Link to={`/jornada/sessao/${sessionId}/dia/${day.id}`} className="block min-w-0 flex-1">
          {card}
        </Link>
      ) : (
        <div className="min-w-0 flex-1">{card}</div>
      )}
    </div>
  )
}
