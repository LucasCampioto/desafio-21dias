import { useState, useRef } from 'react'
import Card from '../../design-system/Card'
import Button from '../../design-system/Button'

export default function VoiceNotePanel({ onTranscript, readOnly }) {
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const mediaRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        setTranscript('Gravação salva. (Transcrição automática disponível na próxima fase com API.)')
        onTranscript?.('Gravação de voz registrada.')
      }
      mediaRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch {
      setTranscript('Permissão de microfone necessária para gravar.')
    }
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
    setRecording(false)
  }

  return (
    <Card variant="immersive">
      <h3 className="font-serif text-xl">Reflexão por voz</h3>
      <p className="mt-2 text-sm text-stone-400">
        Grave uma reflexão sobre o dia. A transcrição automática será integrada com IA na próxima fase.
      </p>
      {!readOnly && (
        <div className="mt-4 flex gap-3">
          {!recording ? (
            <Button variant="accent" size="sm" onClick={startRecording}>
              Iniciar gravação
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={stopRecording}>
              Parar gravação
            </Button>
          )}
        </div>
      )}
      {transcript && <p className="mt-3 text-sm text-stone-300">{transcript}</p>}
    </Card>
  )
}
