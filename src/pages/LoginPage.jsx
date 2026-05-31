import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import Button from '../design-system/Button'
import Input from '../design-system/Input'
import Badge from '../design-system/Badge'

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800">
        <p className="text-stone-400">Carregando...</p>
      </div>
    )
  }

  if (isAuthenticated) {
    navigate('/mural', { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await login(email || 'visitante@quantum.journal', password)
      navigate('/mural')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-stone-900/80 p-8 backdrop-blur-xl"
      >
        <Badge pulse variant="dark" className="mb-6">
          <span>Sua jornada começa aqui</span>
        </Badge>
        <h1 className="font-serif text-4xl font-light text-beige">Quantum Journal</h1>
        <p className="mt-3 text-stone-400">Entre para continuar sua transformação de 21 dias.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            wrapperClassName="[&_input]:rounded-2xl [&_input]:border-white/10 [&_input]:bg-white/5 [&_input]:text-beige [&_input]:focus:bg-white/5 [&_input]:autofill:shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)] [&_input]:autofill:[-webkit-text-fill-color:#e6e3d6] [&_span]:text-stone-400"
          />
          <Input
            label="Senha"
            showPasswordToggle
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            wrapperClassName="[&_input]:rounded-2xl [&_input]:border-white/10 [&_input]:bg-white/5 [&_input]:text-beige [&_input]:focus:bg-white/5 [&_input]:autofill:shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)] [&_input]:autofill:[-webkit-text-fill-color:#e6e3d6] [&_span]:text-stone-400 [&_button]:text-stone-400 [&_button:hover]:text-beige"
          />
          {error && <p className="text-sm text-red-300">{error}</p>}
          <Button type="submit" variant="accent" className="w-full" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-center text-sm text-stone-400">
          <Link to="/cadastro" className="hover:text-beige">
            Criar conta
          </Link>
          <Link to="/recuperar-senha" className="hover:text-beige">
            Esqueci minha senha
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
