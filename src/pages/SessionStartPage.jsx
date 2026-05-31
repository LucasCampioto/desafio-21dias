import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useSession } from '../contexts/SessionContext'
import { sessionStartOptions } from '../data/weeks'
import Button from '../design-system/Button'
import Card from '../design-system/Card'
import PageHeader from '../design-system/PageHeader'
import Badge from '../design-system/Badge'

export default function SessionStartPage() {
  const { startSession } = useSession()
  const navigate = useNavigate()
  const [starting, setStarting] = useState(null)
  const [error, setError] = useState('')

  const handleStart = async (startDay) => {
    setStarting(startDay)
    setError('')

    try {
      await startSession(startDay)
      navigate('/jornada')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível iniciar a jornada.')
    } finally {
      setStarting(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800 px-4 py-12 md:px-12">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          dark
          badge={
            <Badge pulse variant="dark">
              <span>Nova sessão de transformação</span>
            </Badge>
          }
          title="Iniciar jornada"
          subtitle="Escolha por qual semana deseja começar. Jornadas anteriores permanecem salvas na sua lista."
        />

        {error && (
          <p className="mb-4 rounded-2xl border border-red-300/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="space-y-4">
          {sessionStartOptions.map((opt, i) => (
            <motion.div
              key={opt.startDay}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                variant="immersive"
                className="cursor-pointer transition-transform hover:scale-[1.01]"
                onClick={() => handleStart(opt.startDay)}
              >
                <p className="text-xs uppercase tracking-widest text-stone-400">{opt.description}</p>
                <h3 className="mt-2 font-serif text-2xl text-beige">{opt.label}</h3>
                <Button variant="accent" size="sm" className="mt-4" disabled={starting !== null}>
                  {starting === opt.startDay ? 'Iniciando...' : 'Começar'}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
