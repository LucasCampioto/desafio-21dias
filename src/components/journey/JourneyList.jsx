import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { formatDateBR } from '../../lib/utils'
import Card from '../../design-system/Card'
import Button from '../../design-system/Button'
import Badge from '../../design-system/Badge'

function formatSessionDate(iso) {
  if (!iso) return ''
  return formatDateBR(new Date(iso))
}

function JourneyRow({ item, statusLabel, badge, onDelete, deleting }) {
  const [confirming, setConfirming] = useState(false)

  const handleDelete = async (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (!confirming) {
      setConfirming(true)
      return
    }

    await onDelete(item.id)
    setConfirming(false)
  }

  return (
    <div className="relative">
      <Link to={`/jornada/sessao/${item.id}`} className="block">
        <Card
          variant="immersive"
          className="transition-transform hover:scale-[1.01] hover:border-lime/30"
        >
          <div className="flex items-start justify-between gap-4 pr-10">
            <div>
              {badge}
              <h3 className="font-serif text-2xl text-beige">{item.label}</h3>
              <p className="mt-1 text-sm text-stone-400">{item.weekLabel}</p>
              <p className="mt-2 text-xs text-stone-500">{statusLabel}</p>
            </div>
            <Icon
              icon={item.status === 'completed' ? 'solar:eye-linear' : 'solar:arrow-right-linear'}
              width={24}
              className={`shrink-0 ${item.status === 'completed' ? 'text-stone-400' : 'text-lime'}`}
            />
          </div>
        </Card>
      </Link>

      <button
        type="button"
        title="Excluir jornada"
        disabled={deleting}
        onClick={handleDelete}
        onBlur={() => setConfirming(false)}
        className={`absolute right-4 top-4 rounded-full p-2 transition-colors ${
          confirming
            ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
            : 'text-stone-500 hover:bg-stone-800 hover:text-stone-300'
        }`}
      >
        <Icon icon={confirming ? 'solar:trash-bin-trash-bold' : 'solar:trash-bin-minimalistic-linear'} width={18} />
      </button>

      {confirming && (
        <p className="absolute right-4 top-14 z-10 max-w-[10rem] text-right text-[10px] text-red-300">
          Clique de novo para confirmar
        </p>
      )}
    </div>
  )
}

export default function JourneyList({ sessions, onDeleteSession, deletingId }) {
  const activeSessions = sessions.filter((s) => s.status === 'active')
  const completedSessions = sessions.filter((s) => s.status === 'completed')

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Suas jornadas</p>
          <h1 className="mt-2 font-serif text-4xl font-light text-beige md:text-5xl">Transformação</h1>
          <p className="mt-3 text-sm text-stone-400 md:text-base">
            Revise jornadas concluídas ou inicie uma nova sessão de 21 dias.
          </p>
        </div>
        <Link to="/jornada/iniciar">
          <Button variant="accent" size="sm">
            <Icon icon="solar:add-circle-linear" width={18} />
            Nova jornada
          </Button>
        </Link>
      </div>

      {activeSessions.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-stone-400">
            Em andamento
          </h2>
          <div className="space-y-3">
            {activeSessions.map((item) => (
              <JourneyRow
                key={item.id}
                item={item}
                deleting={deletingId === item.id}
                onDelete={onDeleteSession}
                statusLabel={`Iniciada em ${formatSessionDate(item.createdAt)}`}
                badge={
                  <Badge variant="accent" className="mb-3">
                    Em andamento
                  </Badge>
                }
              />
            ))}
          </div>
        </section>
      )}

      {completedSessions.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-stone-400">
            Concluídas
          </h2>
          <div className="space-y-3">
            {completedSessions.map((item) => (
              <JourneyRow
                key={item.id}
                item={item}
                deleting={deletingId === item.id}
                onDelete={onDeleteSession}
                statusLabel={`${item.completedAtLabel || formatSessionDate(item.completedAt)} · 21/21 dias`}
                badge={
                  <Badge variant="dark" className="mb-3 border-green-600/30 text-green-400">
                    <Icon icon="solar:check-circle-bold" width={14} />
                    Concluída
                  </Badge>
                }
              />
            ))}
          </div>
        </section>
      )}

      {sessions.length === 0 && (
        <Card variant="immersive" className="text-center">
          <p className="text-stone-400">Você ainda não iniciou nenhuma jornada.</p>
          <Link to="/jornada/iniciar" className="mt-4 inline-block">
            <Button variant="accent">Iniciar primeira jornada</Button>
          </Link>
        </Card>
      )}

      {completedSessions.length > 0 && activeSessions.length === 0 && (
        <Card variant="immersive" className="border-dashed border-lime/20 bg-lime/5">
          <p className="font-serif text-xl text-beige">Pronto para uma nova transformação?</p>
          <p className="mt-2 text-sm text-stone-400">
            Sua jornada anterior ficará salva aqui. Você pode revisá-la a qualquer momento.
          </p>
          <Link to="/jornada/iniciar" className="mt-4 inline-block">
            <Button variant="accent">Iniciar nova jornada</Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
