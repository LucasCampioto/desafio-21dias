import { useState } from 'react'
import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'framer-motion'
import Card from '../../design-system/Card'
import { cn } from '../../lib/utils'

function SentimentBar({ label, snapshot }) {
  if (!snapshot) {
    return (
      <div className="flex-1">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
        <div className="flex h-8 items-center justify-center rounded-xl bg-stone-100 text-xs text-stone-400">
          Sem dados
        </div>
      </div>
    )
  }

  const { negativePct = 0, neutralPct = 0, positivePct = 0 } = snapshot
  const total = negativePct + neutralPct + positivePct
  const scale = total > 100 ? 100 / total : 1
  const neg = Math.round(negativePct * scale)
  const neu = Math.round(neutralPct * scale)
  const pos = Math.round(positivePct * scale)

  return (
    <div className="flex-1">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      <div className="flex h-8 overflow-hidden rounded-xl border border-stone-200/80">
        {neg > 0 && (
          <div
            className="flex items-center justify-center bg-red-400/80 text-[10px] font-medium text-white"
            style={{ width: `${neg}%` }}
            title={`Negativo ${neg}%`}
          >
            {neg >= 12 ? `${neg}%` : ''}
          </div>
        )}
        {neu > 0 && (
          <div
            className="flex items-center justify-center bg-stone-300/90 text-[10px] font-medium text-stone-700"
            style={{ width: `${neu}%` }}
            title={`Neutro ${neu}%`}
          >
            {neu >= 12 ? `${neu}%` : ''}
          </div>
        )}
        {pos > 0 && (
          <div
            className="flex items-center justify-center bg-lime-400/90 text-[10px] font-medium text-stone-900"
            style={{ width: `${pos}%` }}
            title={`Positivo ${pos}%`}
          >
            {pos >= 12 ? `${pos}%` : ''}
          </div>
        )}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-stone-500">
        <span>Neg. {neg}%</span>
        <span>Neu. {neu}%</span>
        <span>Pos. {pos}%</span>
      </div>
    </div>
  )
}

function EvolutionDelta({ start, end }) {
  if (!start || !end) return null

  const posDelta = Math.round((end.positivePct ?? 0) - (start.positivePct ?? 0))
  const negDelta = Math.round((end.negativePct ?? 0) - (start.negativePct ?? 0))

  const posImproved = posDelta > 0
  const negImproved = negDelta < 0

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {posDelta !== 0 && (
        <span
          className={`rounded-full px-2.5 py-1 font-medium ${
            posImproved ? 'bg-lime-100 text-lime-800' : 'bg-stone-100 text-stone-600'
          }`}
        >
          Positivo {posDelta > 0 ? '+' : ''}
          {posDelta}%
        </span>
      )}
      {negDelta !== 0 && (
        <span
          className={`rounded-full px-2.5 py-1 font-medium ${
            negImproved ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
          }`}
        >
          Negativo {negDelta > 0 ? '+' : ''}
          {negDelta}%
        </span>
      )}
      {posDelta === 0 && negDelta === 0 && (
        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-stone-600">Estável</span>
      )}
    </div>
  )
}

function WeekTrend({ byWeek }) {
  const weeks = ['1', '2', '3']
    .map((key) => byWeek?.[key])
    .filter(Boolean)

  if (weeks.length < 2) return null

  return (
    <div className="mt-4 border-t border-stone-200/60 pt-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-stone-500">
        Positivo ao longo das semanas
      </p>
      <div className="flex items-end gap-2 sm:gap-3">
        {weeks.map((week, index) => {
          const pct = Math.round(week.positivePct ?? 0)
          return (
            <div key={index} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-stone-600">{pct}%</span>
              <div className="flex h-16 w-full items-end rounded-lg bg-stone-100/80 px-1 pb-1">
                <div
                  className="w-full rounded-md bg-lime-400/90 transition-all"
                  style={{ height: `${Math.max(8, pct)}%` }}
                  title={`Semana ${index + 1}: ${pct}% positivo`}
                />
              </div>
              <span className="text-[10px] text-stone-400">S{index + 1}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function hasChartData(campaign) {
  return Boolean(campaign?.start && campaign?.end)
}

function CampaignRow({ campaign }) {
  return (
    <div className="rounded-2xl border border-stone-200/60 bg-white/50 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-serif text-lg text-stone-900">{campaign.label}</h4>
        <div className="flex flex-wrap items-center gap-2">
          <EvolutionDelta start={campaign.start} end={campaign.end} />
          {campaign.overallTone && (
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs capitalize text-stone-600">
              {campaign.overallTone}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <SentimentBar label="Início (semana 1)" snapshot={campaign.start} />
        <div className="hidden items-center text-stone-300 sm:flex" aria-hidden>
          →
        </div>
        <SentimentBar label="Final (semana 3)" snapshot={campaign.end} />
      </div>
      <WeekTrend byWeek={campaign.byWeek} />
    </div>
  )
}

export default function EvolutionCampaignChart({ campaigns }) {
  const withData = (campaigns ?? []).filter(hasChartData)
  const [expanded, setExpanded] = useState(false)

  if (!withData.length) return null

  const journeyCount = withData.length
  const summaryLabel =
    journeyCount === 1 ? '1 jornada com dados' : `${journeyCount} jornadas com dados`

  return (
    <Card variant="panel" className="md:col-span-2 !p-0 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-start justify-between gap-4 px-6 py-6 text-left md:px-8 md:py-8"
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-xl text-stone-900">Evolução emocional por jornada</h3>
          <p className="mt-2 text-sm text-stone-500">
            {expanded
              ? 'Compare como você começou e terminou cada campanha.'
              : `${summaryLabel} — clique para ver início vs. final de cada campanha.`}
          </p>
        </div>
        <div
          className={cn(
            'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
            expanded
              ? 'border-stone-400/60 bg-stone-100 text-stone-700'
              : 'border-stone-300/60 text-stone-500'
          )}
        >
          <Icon
            icon="solar:alt-arrow-down-linear"
            width={20}
            className={cn('transition-transform duration-300', expanded && 'rotate-180')}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-stone-200/60 px-6 pb-6 md:px-8 md:pb-8">
              <p className="pt-4 text-sm text-stone-500">
                Vermelho = negativo, cinza = neutro, verde = positivo (média diária em %).
              </p>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-stone-500">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-400/80" />
                  Negativo
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-stone-300/90" />
                  Neutro
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-lime-400/90" />
                  Positivo
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {withData.map((campaign) => (
                  <CampaignRow key={campaign.sessionId} campaign={campaign} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
