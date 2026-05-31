import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import Button from '../../design-system/Button'
import { useAuth } from '../../contexts/AuthContext'
import { useSession } from '../../contexts/SessionContext'
import * as assistantController from '../../controllers/assistantController'
import ThinkingIndicator from './ThinkingIndicator'
import TypewriterMessage from './TypewriterMessage'
import MessageContent from './MessageContent'

export default function ChatWindow() {
  const { user } = useAuth()
  const { session } = useSession()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  /** `null`: sem stream; string (inclusive vazia): mostra máquina de escrever */
  const [streamingText, setStreamingText] = useState(null)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (!user?.id) {
      setMessages([])
      return
    }
    setMessages(assistantController.getAssistantMessages(user.id))
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return undefined

    const refreshIfExpired = () => {
      setMessages(assistantController.getAssistantMessages(user.id))
    }

    window.addEventListener('focus', refreshIfExpired)
    const interval = setInterval(refreshIfExpired, 5 * 60 * 1000)

    return () => {
      window.removeEventListener('focus', refreshIfExpired)
      clearInterval(interval)
    }
  }, [user?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages, typing, streamingText, scrollToBottom])

  const revealScroll = useCallback(() => scrollToBottom(), [scrollToBottom])

  const send = async () => {
    if (!input.trim() || typing || streamingText !== null || !user?.id) return

    const userMsg = input.trim()
    setInput('')
    setError(null)
    setStreamingText(null)

    const withUser = assistantController.appendMessage(user.id, 'user', userMsg)
    setMessages(withUser)
    setTyping(true)

    try {
      const reply = await assistantController.sendChatMessage(userMsg, session?.id)
      setTyping(false)
      setStreamingText(reply ?? '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível falar com Aurora agora.')
      setTyping(false)
    }
  }

  const handleStreamComplete = (finalText) => {
    if (!user?.id) return
    const cleaned = typeof finalText === 'string' ? finalText : String(streamingText ?? '')
    const next = assistantController.appendMessage(user.id, 'assistant', cleaned)
    setMessages(next)
    setStreamingText(null)
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-3xl border border-stone-300/40 bg-white/40 backdrop-blur-md lg:h-[600px]">
      <div className="border-b border-stone-300/30 px-6 py-4">
        <p className="font-serif text-xl text-stone-900">Aurora</p>
        <p className="text-sm text-stone-500">Sua assistente pessoal nesta jornada</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-stone-900 text-beige'
                  : 'bg-white/80 text-stone-700 shadow-sm'
              }`}
            >
              <MessageContent content={msg.content} role={msg.role} />
            </div>
          </div>
        ))}
        {typing && streamingText === null && <ThinkingIndicator />}
        {streamingText !== null && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl bg-white/80 px-4 py-3 text-sm shadow-sm">
              <TypewriterMessage
                text={streamingText}
                delayMs={6}
                charsPerTick={4}
                onReveal={revealScroll}
                onComplete={handleStreamComplete}
              />
            </div>
          </div>
        )}
        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 border-t border-stone-300/30 p-4">
        <input
          className="flex-1 rounded-full border border-stone-300 bg-white/70 px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-stone-900/10"
          placeholder="Compartilhe o que está sentindo..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={typing || streamingText !== null}
        />
        <Button variant="primary" size="sm" onClick={send} disabled={typing || streamingText !== null}>
          <Icon icon="solar:plain-linear" width={18} />
        </Button>
      </div>
    </div>
  )
}
