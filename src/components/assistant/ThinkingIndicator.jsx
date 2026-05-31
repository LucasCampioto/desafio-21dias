import { useEffect, useState } from 'react'

const DEFAULT_LABEL = 'Aurora está refletindo...'

/**
 * Efeito de digitação em loop: escreve letra a letra, apaga e recomeça.
 */
export default function ThinkingIndicator({ label = DEFAULT_LABEL }) {
  const [display, setDisplay] = useState('')
  const [phase, setPhase] = useState('typing')

  useEffect(() => {
    let timer = 0

    if (phase === 'typing') {
      if (display.length < label.length) {
        timer = window.setTimeout(() => {
          setDisplay(label.slice(0, display.length + 1))
        }, 55)
      } else {
        timer = window.setTimeout(() => setPhase('pauseEnd'), 900)
      }
    } else if (phase === 'pauseEnd') {
      timer = window.setTimeout(() => setPhase('deleting'), 0)
    } else if (phase === 'deleting') {
      if (display.length > 0) {
        timer = window.setTimeout(() => {
          setDisplay(label.slice(0, display.length - 1))
        }, 35)
      } else {
        timer = window.setTimeout(() => setPhase('pauseStart'), 400)
      }
    } else if (phase === 'pauseStart') {
      timer = window.setTimeout(() => setPhase('typing'), 0)
    }

    return () => window.clearTimeout(timer)
  }, [display, phase, label])

  return (
    <div className="flex justify-start px-1 py-1" role="status" aria-live="polite">
      <p className="text-sm leading-snug text-stone-500">
        {display}
        <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-stone-500/70 align-[-3px]" />
      </p>
    </div>
  )
}
