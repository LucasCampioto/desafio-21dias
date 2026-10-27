import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { useMuralPresence } from '../../hooks/useMuralPresence'

const PERIOD_LABELS = {
  morning: 'Manhã',
  afternoon: 'Tarde',
  evening: 'Noite',
}

export default function MuralPresenceBanner() {
  const { active, dismiss, loading } = useMuralPresence()

  return (
    <AnimatePresence mode="wait">
      {!loading && active && (
        <motion.div
          key={active.slotId}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mb-2 overflow-hidden rounded-2xl border border-sage/40 bg-gradient-to-r from-beige-light via-white to-sage/10 shadow-sm"
        >
          <div className="flex items-start gap-3 p-3 md:p-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-900/5">
              <Icon icon="solar:heart-pulse-linear" width={20} className="text-stone-700" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  {PERIOD_LABELS[active.period] ?? 'Presença'}
                </p>
              </div>
              <h3 className="mt-1 font-serif text-lg text-stone-900">{active.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">
                {typeof active.body === 'string' ? active.body : ''}
              </p>
              {typeof active.quote === 'string' && active.quote && !active.quote.includes('[object Object]') && (
                <blockquote className="mt-3 border-l-2 border-sage/60 pl-3 text-sm italic text-stone-600">
                  {active.quote}
                </blockquote>
              )}
            </div>

            <button
              type="button"
              onClick={dismiss}
              aria-label="Fechar lembrete"
              className="shrink-0 rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
            >
              <Icon icon="solar:close-circle-linear" width={22} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
