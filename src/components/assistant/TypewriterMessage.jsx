import { useEffect, useRef, useState } from 'react'
import MessageContent from './MessageContent'

/**
 * Revela texto rapidamente com efeito de digitação e renderiza Markdown.
 * @param {object} props
 * @param {string} props.text
 * @param {number} [props.delayMs=6] intervalo entre ticks
 * @param {number} [props.charsPerTick=4] caracteres por tick
 * @param {(fullText: string) => void} [props.onComplete]
 * @param {() => void} [props.onReveal]
 */
export default function TypewriterMessage({
  text,
  delayMs = 6,
  charsPerTick = 4,
  onComplete,
  onReveal,
}) {
  const [visible, setVisible] = useState('')
  const [done, setDone] = useState(false)
  const timer = useRef(0)

  const onCompleteRef = useRef(onComplete)
  const onRevealRef = useRef(onReveal)

  useEffect(() => {
    onCompleteRef.current = onComplete
    onRevealRef.current = onReveal
  }, [onComplete, onReveal])

  useEffect(() => {
    const full = typeof text === 'string' ? text : ''
    setVisible('')
    setDone(false)

    window.clearInterval(timer.current)

    if (!full.length) {
      window.setTimeout(() => {
        setDone(true)
        onCompleteRef.current?.('')
      }, 0)
      return undefined
    }

    let idx = 0
    timer.current = window.setInterval(() => {
      idx = Math.min(full.length, idx + charsPerTick)
      const slice = full.slice(0, idx)
      setVisible(slice)
      onRevealRef.current?.()

      if (idx >= full.length) {
        window.clearInterval(timer.current)
        setDone(true)
        onCompleteRef.current?.(full)
      }
    }, delayMs)

    return () => {
      window.clearInterval(timer.current)
    }
  }, [text, delayMs, charsPerTick])

  return (
    <div className="relative">
      <MessageContent content={visible} role="assistant" />
      {!done && (
        <span
          className="ml-0.5 inline-block h-4 w-px animate-pulse rounded bg-stone-600/85 align-[-3px]"
          aria-hidden
        />
      )}
    </div>
  )
}
