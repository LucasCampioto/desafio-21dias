import { useState } from 'react'
import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'framer-motion'
import Card from '../../design-system/Card'
import { cn } from '../../lib/utils'

function normalizeBar(snapshot) {
  if (!snapshot) return null
  let neg = Math.round(snapshot.negativePct ?? 0)
  let neu = Math.round(snapshot.neutralPct ?? 0)
  let pos = Math.round(snapshot.positivePct ?? 0)
  const sum = neg + neu + pos
  if (sum <= 0) return { neg: 0, neu: 100, pos: 0 }
  if (sum !== 100) {
    const ordered = [
      ['neg', neg],
      ['neu', neu],
      ['pos', pos],
    ].sort((a, b) => b[1] - a[1])
    const key = ordered[0][0]
    const diff = 100 - sum
    if (key === 'neg') neg += diff
    else if (key === 'neu') neu += diff
    else pos += diff
  }
  return { neg, neu, pos }
}

function SentimentBar({ label, snapshot }) {
  const bar = normalizeBar(snapshot)
  if (!bar) {
    return (
      <div className="flex-1">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
        <div className="flex h-7 items-center justify-center rounded-xl bg-stone-100 text-xs text-stone-400">
          Sem dados
        </div>
      </div>
    )
  }

  const { neg, neu, pos } = bar

  return (
    <div className="flex-1">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      <div className="flex h-7 overflow-hidden rounded-xl border border-stone-200/80">
        {neg > 0 && (
          <div className="bg-red-400/80" style={{ width: `${neg}%` }} title={`Mais pesado ${neg}%`} />
        )}
        {neu > 0 && (
          <div className="bg-stone-300/90" style={{ width: `${neu}%` }} title={`Neutro ${neu}%`} />
        )}
        {pos > 0 && (
          <div className="bg-lime-400/90" style={{ width: `${pos}%` }} title={`Mais leve ${pos}%`} />
        )}
      </div>
    </div>
  )
}

function changeBadgeClass(change) {
  if (change === 'improved' || change === 'mixed_improved') return 'bg-lime-100 text-lime-800'
  if (change === 'worsened' || change === 'mixed_worsened') return 'bg-red-50 text-red-700'
  return 'bg-stone-100 text-stone-600'
}

function QuoteBlock({ excerpt, tone = 'neutral' }) {
  if (!excerpt?.text) return null
  return (
    <blockquote
      className={cn(
        'mt-3 rounded-2xl border-l-4 bg-white/70 px-4 py-3 text-sm leading-relaxed text-stone-700',
        tone === 'positive' && 'border-lime-400',
        tone === 'negative' && 'border-red-300',
        tone === 'neutral' && 'border-stone-300',
      )}
    >
      “{excerpt.text}”
      {excerpt.dayId ? (
        <span className="mt-1 block text-[11px] text-stone-400">Dia {excerpt.dayId}</span>
      ) : null}
    </blockquote>
  )
}

function hasChartData(campaign) {
  return Boolean(campaign?.start && campaign?.end)
}

function CampaignRow({ campaign, insight }) {
  const startLabel = campaign.startWeek ? `Começo` : 'Começo'
  const endLabel = campaign.endWeek ? `Agora` : 'Agora'
  const sourceNote =
    campaign.source === 'answers_heuristic'
      ? 'Leitura a partir dos exercícios — a análise emocional automática ainda está incompleta nesta jornada.'
      : null

  return (
    <div className="rounded-2xl border border-stone-200/60 bg-white/50 p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-serif text-lg text-stone-900">{campaign.label}</h4>
        {insight?.badge && (
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-medium',
              changeBadgeClass(insight.change),
            )}
          >
            {insight.badge}
          </span>
        )}
      </div>

      {insight?.narrative && (
        <p className="text-[15px] leading-relaxed text-stone-700">{insight.narrative}</p>
      )}

      <QuoteBlock excerpt={insight?.excerpts?.positive} tone="positive" />
      <QuoteBlock excerpt={insight?.excerpts?.negative} tone="negative" />

      <div className="mt-5 border-t border-stone-200/60 pt-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-stone-400">
          Visual do percurso
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <SentimentBar label={startLabel} snapshot={campaign.start} />
          <div className="hidden text-stone-300 sm:block" aria-hidden>
            →
          </div>
          <SentimentBar label={endLabel} snapshot={campaign.end} />
        </div>
      </div>

      {sourceNote && <p className="mt-3 text-[11px] text-stone-400">{sourceNote}</p>}
    </div>
  )
}

function CrossCampaignPanel({ comparison }) {
  if (!comparison) return null

  const highlight = comparison.highlights?.[0]
  const paragraphs = comparison.story?.paragraphs || comparison.narratives || []
  const excerpts = comparison.story?.excerpts || {}

  return (
    <div className="mt-8 border-t border-stone-200/60 pt-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-serif text-xl text-stone-900">Entre campanhas</h3>
          <p className="mt-1 text-sm text-stone-500">
            Uma leitura do que mudou de uma jornada para a outra, com base no que você escreveu.
          </p>
        </div>
        {comparison.story?.badge && (
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-medium',
              changeBadgeClass(comparison.story.change),
            )}
          >
            {comparison.story.badge}
          </span>
        )}
      </div>

      <div className="space-y-3 text-[15px] leading-relaxed text-stone-700">
        {paragraphs.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <QuoteBlock excerpt={excerpts.currentPositive} tone="positive" />
      <QuoteBlock excerpt={excerpts.baselineNegative || excerpts.currentNegative} tone="negative" />

      {comparison.available && highlight && (
        <div className="mt-5 rounded-2xl border border-stone-200/60 bg-white/40 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-stone-400">
            Visual da comparação
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <SentimentBar label={highlight.fromLabel || 'Antes'} snapshot={highlight.from} />
            <div className="hidden text-stone-300 sm:block" aria-hidden>
              →
            </div>
            <SentimentBar label={highlight.toLabel || 'Depois'} snapshot={highlight.to} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function EvolutionCampaignChart({
  campaigns,
  withinCampaign = [],
  comparison = null,
}) {
  const withData = (campaigns ?? []).filter(hasChartData)
  const insightBySession = Object.fromEntries(
    (withinCampaign || []).map((item) => [item.sessionId, item]),
  )
  const [expanded, setExpanded] = useState(true)

  if (!withData.length) return null

  const journeyCount = withData.length
  const summaryLabel =
    journeyCount === 1 ? '1 jornada com leitura' : `${journeyCount} jornadas com leitura`

  return (
    <Card variant="panel" className="md:col-span-2 !p-0 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-start justify-between gap-4 px-6 py-6 text-left md:px-8 md:py-8"
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-xl text-stone-900">Evolução emocional</h3>
          <p className="mt-2 text-sm text-stone-500">
            {expanded
              ? 'A história do que mudou — com trechos seus. Os gráficos só ilustram o texto.'
              : `${summaryLabel} — clique para ler a história da sua evolução.`}
          </p>
        </div>
        <div
          className={cn(
            'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
            expanded
              ? 'border-stone-400/60 bg-stone-100 text-stone-700'
              : 'border-stone-300/60 text-stone-500',
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
              <div className="mt-6 space-y-4">
                <h4 className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  Em cada jornada
                </h4>
                {withData.map((campaign) => (
                  <CampaignRow
                    key={campaign.sessionId}
                    campaign={campaign}
                    insight={insightBySession[campaign.sessionId]}
                  />
                ))}
              </div>

              <CrossCampaignPanel comparison={comparison} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
