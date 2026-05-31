import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../design-system/Button'
import Input from '../design-system/Input'

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-stone-900/80 p-8 backdrop-blur-xl"
      >
        <h1 className="font-serif text-4xl font-light text-beige">Recuperar senha</h1>
        <p className="mt-3 text-stone-400">
          Enviaremos um link de recuperação para seu e-mail. (Mock — backend na próxima fase.)
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            alert('Link de recuperação enviado (simulação).')
          }}
        >
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            wrapperClassName="[&_input]:rounded-2xl [&_input]:border-white/10 [&_input]:bg-white/5 [&_input]:text-beige [&_input]:focus:bg-white/5 [&_input]:autofill:shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)] [&_input]:autofill:[-webkit-text-fill-color:#e6e3d6] [&_span]:text-stone-400"
          />
          <Button type="submit" variant="accent" className="w-full">
            Enviar link
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-400">
          <Link to="/login" className="text-beige hover:underline">
            Voltar ao login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
