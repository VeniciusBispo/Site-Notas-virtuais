import { useState } from 'react'

interface UseSpeechRecognitionReturn {
  isRecording: boolean
  startRecording: () => void
  stopRecording: () => void
}

let speechRecognition: SpeechRecognition | null = null

export function useSpeechRecognition(onTranscription: (text: string) => void): UseSpeechRecognitionReturn {
  const [isRecording, setIsRecording] = useState(false)

  function startRecording() {
    const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

    if (!isSpeechRecognitionAPIAvailable) {
      alert('Infelizmente seu navegador não suporta a API de gravação!')
      return
    }

    setIsRecording(true)
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    speechRecognition = new SpeechRecognitionAPI()

    speechRecognition.lang = 'pt-BR'
    speechRecognition.continuous = true
    speechRecognition.maxAlternatives = 1
    speechRecognition.interimResults = true

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)
      }, '')
      onTranscription(transcription)
    }

    speechRecognition.onerror = (event) => {
      console.error(event)
    }

    speechRecognition.start()
  }

  function stopRecording() {
    setIsRecording(false)
    if (speechRecognition) {
      speechRecognition.stop()
    }
  }

  return {
    isRecording,
    startRecording,
    stopRecording
  }
}
