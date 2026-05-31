import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import Button from '../design-system/Button'
import Input from '../design-system/Input'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await signup(name || 'Viajante', email || 'novo@quantum.journal', password)
      navigate('/mural')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta.')
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
        <h1 className="font-serif text-4xl font-light text-beige">Criar conta</h1>
        <p className="mt-3 text-stone-400">Comece sua sessão de transformação.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            wrapperClassName="[&_input]:rounded-2xl [&_input]:border-white/10 [&_input]:bg-white/5 [&_input]:text-beige [&_input]:focus:bg-white/5 [&_input]:autofill:shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)] [&_input]:autofill:[-webkit-text-fill-color:#e6e3d6] [&_span]:text-stone-400"
          />
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
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            wrapperClassName="[&_input]:rounded-2xl [&_input]:border-white/10 [&_input]:bg-white/5 [&_input]:text-beige [&_input]:focus:bg-white/5 [&_input]:autofill:shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)] [&_input]:autofill:[-webkit-text-fill-color:#e6e3d6] [&_span]:text-stone-400"
          />
          {error && <p className="text-sm text-red-300">{error}</p>}
          <Button type="submit" variant="accent" className="w-full" disabled={submitting}>
            {submitting ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-400">
          Já tem conta?{' '}
          <Link to="/login" className="text-beige hover:underline">
            Entrar
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
