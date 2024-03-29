import * as dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'

interface NewNotesProps {
  onNoteCreated: (content: string) => void
}
let speechRecognition: SpeechRecognition | null = null
export function NewNotes({ onNoteCreated }: NewNotesProps) {

  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
  const [content, setContent] = useState('')
  const [isRecording, setIsRecording] = useState(false)


  function handleStartEditor() {
    setShouldShowOnboarding(false)
  }
  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value)

    if (event.target.value == '') {
      setShouldShowOnboarding(true)
    }
  }
  function handleSaveNote(event: FormEvent) {
    event.preventDefault()

    if (content == '') {
      return
    }

    onNoteCreated(content)
    setContent('')
    setShouldShowOnboarding(true)
    toast.success('Nota criada com sucesso!')
  }
  function handleStartRecording() {

    const isSpeechRecognitionAPIAvaible = 'SpeechRecognition' in window
      || 'webkitSpeechRecognition' in window

    if (!isSpeechRecognitionAPIAvaible) {
      alert('Infelismente seu navegador não suporta a API de gravação!')
      return
    }
    setIsRecording(true)
    setShouldShowOnboarding(false)
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
      setContent(transcription)
    }
    speechRecognition.onerror = (event) => {
      console.log(event)
    }
    speechRecognition.start()
  }
  function handleStopRecording() {
    setIsRecording(false)
    if(speechRecognition != null) {
      speechRecognition.stop()
    }
    
  }
  return (
    <dialog.Root>
      <dialog.Trigger className='flex flex-col rounded-md bg-slate-700  text-left p-5 gap-y-3 outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400'>

        <span className='text-sm font-medium text-slate-200'>

          Adicionar nota
        </span>
        <p className='text-sm leading-6 text-slate-400'>

          Grave uma nota em áudio que será convertida para texto automaticamente.
        </p>
        <div></div>
      </dialog.Trigger>
      <dialog.Portal>
        <dialog.Overlay className='inset-0 fixed bg-black/50' />
        <dialog.Content className='fixed overflow-hidden  inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:h-[60vh] md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full bg-slate-700 md:rounded-md flex flex-col'>
          <dialog.Close className='absolute top-0 right-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100'>
            <X className='size-5' />
          </dialog.Close>
          <form className='flex-1 flex flex-col'>
            <div className='flex flex-1 flex-col gap-3 p-5'>
              <span className='text-sm font-medium text-slate-300'>
                Adicionar nota
              </span>
              {shouldShowOnboarding ? (
                <p className='text-sm leading-6 text-slate-400'>
                  Comece <button type='button' onClick={handleStartRecording} className='text-lime-400 font-medium hover:underline'>gravando uma nota</button> em áudio ou se preferir <button type='button' onClick={handleStartEditor} className='hover:underline text-lime-400 font-medium'>utilize apenas texto</button>
                </p>
              ) : (
                <textarea
                  autoFocus
                  className='text-ms leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'
                  onChange={handleContentChange}
                  value={content}
                />
              )}
            </div>

            {isRecording ? (
              <button
                type="button"
                onClick={handleStopRecording}
                className='w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100'
              >
                <div className='size-3 rounded-full bg-red-500 animate-bounce' />
                Gravando! (click p/ interronper)
              </button>
            ) : (
              <button
                onClick={handleSaveNote}
                type="button"
                className='w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500'
              >
                Salvar nota
              </button>
            )}
          </form>
        </dialog.Content>
      </dialog.Portal>
    </dialog.Root>

  )
}