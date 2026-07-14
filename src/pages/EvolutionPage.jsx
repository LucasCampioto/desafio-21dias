import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSession } from '../contexts/SessionContext'
import { useAuth } from '../contexts/AuthContext'
import * as evolutionController from '../controllers/evolutionController'
import EvolutionInsight from '../components/evolution/EvolutionInsight'
import EvolutionCampaignChart from '../components/evolution/EvolutionCampaignChart'
import PageHeader from '../design-system/PageHeader'
import Badge from '../design-system/Badge'

function formatEmotionalProgress(report, withinCampaign) {
  if (Array.isArray(withinCampaign) && withinCampaign.length > 0) {
    const body = withinCampaign.map((item) => `• ${item.narrative}`).join('\n')
    return { title: 'Progresso emocional por jornada', body }
  }

  const section = report?.emotionalProgress
  if (!section) return null

  const title = section.title || 'Progresso emocional'
  const narrative =
    section.narrative ||
    (Array.isArray(section.weeks) && section.weeks.length > 0
      ? section.weeks
          .map((week) => {
            const label = week.label ?? week.title ?? `Semana ${week.week}`
            const neg = week.negativePct ?? week.negative
            const pos = week.positivePct ?? week.positive
            const pct =
              neg != null && pos != null
                ? ` (${Math.round(neg)}% neg. · ${Math.round(pos)}% pos.)`
                : ''
            return `• ${label}${pct}: ${week.summary ?? week.narrative ?? ''}`
          })
          .join('\n')
      : null)

  return { title, body: narrative }
}

function formatPatterns(report) {
  const section = report?.patterns
  if (!section) return null

  const title = section.title || 'Padrões reconhecidos'
  const items = section.items ?? []
  const body =
    items.length > 0
      ? items.map((item) => `• ${item}`).join('\n')
      : section.narrative ?? null

  return { title, body }
}

function formatCrossCampaignInsights(report, comparison) {
  if (comparison?.narratives?.length) {
    return {
      title: 'Entre jornadas',
      body: comparison.narratives.join('\n\n'),
    }
  }

  const insights = report?.crossCampaignInsights
  if (!Array.isArray(insights) || insights.length === 0) return null

  const body = insights
    .map((item) => {
      const metric = item.metric ? ` (${item.metric})` : ''
      return `• ${item.title}${metric}: ${item.narrative ?? ''}`
    })
    .join('\n')

  return { title: 'Entre jornadas', body }
}

export default function EvolutionPage() {
  const { user } = useAuth()
  const { session, sessions, hasSession } = useSession()
  const [insights, setInsights] = useState(null)
  const [chartCampaigns, setChartCampaigns] = useState([])
  const [withinCampaign, setWithinCampaign] = useState([])
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const focusSession = session ?? sessions.find((s) => s.status === 'completed') ?? null

  useEffect(() => {
    let cancelled = false

    async function loadEvolution() {
      if (!hasSession && sessions.length === 0) {
        setInsights(null)
        setChartCampaigns([])
        setWithinCampaign([])
        setComparison(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const [report, chartData] = await Promise.all([
          evolutionController.fetchEvolutionInsights().catch(() => null),
          evolutionController.fetchEvolutionCharts(),
        ])
        if (!cancelled) {
          setInsights(report)
          setChartCampaigns(chartData.campaigns)
          setWithinCampaign(chartData.withinCampaign)
          setComparison(chartData.comparison)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Não foi possível carregar seus insights.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadEvolution()

    return () => {
      cancelled = true
    }
  }, [hasSession, sessions.length])

  const emotional = formatEmotionalProgress(insights, withinCampaign)
  const patterns = formatPatterns(insights)
  const crossCampaign = formatCrossCampaignInsights(insights, comparison)
  const auroraMessage = insights?.auroraMessage

  const fallbackEmotional = focusSession
    ? `Você completou ${focusSession.status === 'completed' ? '21' : 'parte dos'} dias nesta jornada. Cada dia concluído é uma prova de que você está presente no processo — observando, decidindo e agindo com mais consciência.`
    : 'Inicie uma sessão para que Aurora possa refletir sobre sua evolução ao longo dos 21 dias.'

  return (
    <div className="px-4 py-8 md:px-8 lg:px-12">
      <PageHeader
        badge={
          <Badge pulse>
            <span>Espelho de evolução</span>
          </Badge>
        }
        title="Sua evolução"
        subtitle={`${user?.name}, este é um reflexo da sua jornada — padrões, percentuais e comparativos entre campanhas.`}
      />

      {loading && (
        <p className="mb-6 text-sm text-stone-500">Aurora está analisando sua jornada...</p>
      )}

      {error && (
        <p className="mb-6 rounded-2xl border border-stone-300/40 bg-white/60 px-4 py-3 text-sm text-stone-600">
          {error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {!loading && chartCampaigns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2"
          >
            <EvolutionCampaignChart
              campaigns={chartCampaigns}
              withinCampaign={withinCampaign}
              comparison={comparison}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <EvolutionInsight
            title={emotional?.title ?? 'Progresso emocional'}
            body={emotional?.body ?? fallbackEmotional}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <EvolutionInsight
            title={patterns?.title ?? 'Padrões reconhecidos'}
            body={
              patterns?.body ??
              'Conforme você preenche os exercícios diários, insights sobre seus padrões aparecerão aqui.'
            }
          />
        </motion.div>

        {crossCampaign && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="md:col-span-2"
          >
            <EvolutionInsight title={crossCampaign.title} body={crossCampaign.body} />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: crossCampaign ? 0.2 : 0.15 }}
          className="md:col-span-2"
        >
          <EvolutionInsight
            title="Mensagem de Aurora"
            body={
              auroraMessage ??
              'Percebo em você uma disposição para olhar com honestidade. A transformação não acontece de uma vez — ela se constrói em pequenas decisões coerentes, dia após dia. Continue.'
            }
          />
        </motion.div>
      </div>
    </div>
  )
}
