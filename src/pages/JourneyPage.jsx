import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSession } from '../contexts/SessionContext'
import JourneyList from '../components/journey/JourneyList'

export default function JourneyPage() {
  const { sessions, deleteSession } = useSession()
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  const handleDeleteSession = async (sessionId) => {
    setError('')
    setDeletingId(sessionId)
    try {
      await deleteSession(sessionId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir a jornada.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 px-4 py-8 md:px-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
        {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
        <JourneyList sessions={sessions} onDeleteSession={handleDeleteSession} deletingId={deletingId} />
      </motion.div>
    </div>
  )
}
