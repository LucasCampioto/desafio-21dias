import { useState } from 'react'
import { Icon } from '@iconify/react'
import Card from '../../design-system/Card'
import Input from '../../design-system/Input'
import Button from '../../design-system/Button'
import { useAuth } from '../../contexts/AuthContext'

function formatMemberSince(isoDate) {
  if (!isoDate) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDate))
}

export default function UserProfileSettings() {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      setMessage('Informe seu nome.')
      return
    }

    if (!trimmedEmail) {
      setMessage('Informe seu e-mail.')
      return
    }

    setSubmitting(true)

    try {
      await updateProfile({ name: trimmedName, email: trimmedEmail })
      setMessage('Dados atualizados com sucesso.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Não foi possível atualizar seus dados.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card variant="panel">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900/5">
          <Icon icon="solar:user-circle-linear" width={22} className="text-stone-700" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-xl text-stone-900">Seus dados</h3>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            Informações da sua conta neste dispositivo.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <Input label="Nome" value={name} onChange={(event) => setName(event.target.value)} />
        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <p className="text-xs text-stone-500">
          Conta criada em {formatMemberSince(user?.createdAt ?? user?.loggedInAt)}
        </p>

        <Button type="submit" variant="secondary" size="sm" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </form>

      {message && <p className="mt-4 text-sm text-stone-700">{message}</p>}
    </Card>
  )
}
