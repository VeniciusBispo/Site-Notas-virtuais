import * as Dialog from '@radix-ui/react-dialog'
import { X, Mic, FileText, Sparkles, Plus, Tag, Hash, LayoutGrid, Type } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpeechRecognition } from '../hooks/use-speech-recognition'
import { NoteCategory } from '../types/note'

interface NewNoteCardProps {
  onNoteCreated: (content: string, title: string, category: NoteCategory, tags: string[]) => void
}

const CATEGORIES: NoteCategory[] = ['Geral', 'Trabalho', 'Estudo', 'Pessoal', 'Ideias']

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<NoteCategory>('Geral')
  const [tagsInput, setTagsInput] = useState('')

  const { isRecording, startRecording, stopRecording } = useSpeechRecognition((transcription) => {
    setContent(transcription)
  })

  function handleStartEditor() {
    setShouldShowOnboarding(false)
  }

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const value = event.target.value
    setContent(value)

    if (value === '' && title === '') {
      setShouldShowOnboarding(true)
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault()

    if (content === '') return

    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    onNoteCreated(content, title, category, tags)
    
    // Reset state
    setContent('')
    setTitle('')
    setCategory('Geral')
    setTagsInput('')
    setShouldShowOnboarding(true)
    toast.success('Nota salva com sucesso!')
  }

  function handleStartRecording() {
    startRecording()
    setShouldShowOnboarding(false)
  }

  const charCount = content.length

  return (
    <Dialog.Root>
      <Dialog.Trigger className="group relative flex flex-col w-full h-full text-left bg-brand-600 rounded-2xl p-8 gap-4 overflow-hidden outline-none transition-all hover:bg-brand-500 hover:shadow-2xl hover:shadow-brand-500/20 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-400">
        <div className="flex items-center justify-between w-full">
           <div className="bg-brand-400/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
             <Plus className="size-6 text-brand-100" />
           </div>
           <Sparkles className="size-5 text-brand-300 opacity-50" />
        </div>
        
        <div className="space-y-2">
          <span className="text-lg font-bold text-brand-50 block">Nova Nota</span>
          <p className="text-sm leading-relaxed text-brand-200 font-medium">
            Grave áudio ou use o editor para criar notas inteligentes com tags e categorias.
          </p>
        </div>
        <div className="absolute -bottom-4 -right-4 size-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-surface-950/80 backdrop-blur-md z-40" />
        <Dialog.Content className="fixed overflow-hidden z-50 inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:h-[85vh] md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[800px] w-full bg-surface-900 border border-surface-800 md:rounded-3xl shadow-2xl flex flex-col outline-none">
          
          <Dialog.Close className="absolute top-4 right-4 z-10 bg-surface-800/50 hover:bg-red-500/20 hover:text-red-400 p-2 rounded-full text-surface-400 transition-all active:scale-95">
            <X className="size-5" />
          </Dialog.Close>

          <form className="flex-1 flex flex-col" onSubmit={handleSaveNote}>
            <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-8">
              <div className="flex items-center gap-3">
                <span className="bg-brand-500/10 text-brand-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {shouldShowOnboarding ? 'Criar Nota' : 'Editor de Versão'}
                </span>
              </div>

              {shouldShowOnboarding ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-12 py-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <button type="button" onClick={handleStartRecording} className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-surface-800/50 border border-surface-700 hover:border-brand-500/50 hover:bg-brand-500/5 transition-all group">
                      <div className="size-16 rounded-2xl bg-brand-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Mic className="size-8 text-brand-400" />
                      </div>
                      <div className="text-center">
                        <span className="block text-lg font-bold text-surface-100">Áudio</span>
                        <span className="text-sm text-surface-400">Transcrição em tempo real</span>
                      </div>
                    </button>
                    <button type="button" onClick={handleStartEditor} className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-surface-800/50 border border-surface-700 hover:border-brand-500/50 hover:bg-brand-500/5 transition-all group">
                      <div className="size-16 rounded-2xl bg-surface-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="size-8 text-surface-200" />
                      </div>
                      <div className="text-center">
                        <span className="block text-lg font-bold text-surface-100">Editor</span>
                        <span className="text-sm text-surface-400">Ferramentas de produtividade</span>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  {/* Title & Metadata Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-surface-500 uppercase tracking-widest flex items-center gap-2">
                        <Type className="size-3" /> Título
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Reunião de Planejamento"
                        className="w-full bg-surface-800/50 border border-surface-700 rounded-xl px-4 py-3 text-surface-100 placeholder:text-surface-600 outline-none focus:border-brand-500 transition-all"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-surface-500 uppercase tracking-widest flex items-center gap-2">
                        <LayoutGrid className="size-3" /> Categoria
                      </label>
                      <select
                        className="w-full bg-surface-800/50 border border-surface-700 rounded-xl px-4 py-3 text-surface-100 outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer"
                        value={category}
                        onChange={e => setCategory(e.target.value as NoteCategory)}
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat} className="bg-surface-900">{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-widest flex items-center gap-2">
                      <Tag className="size-3" /> Tags (separadas por vírgula)
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-brand-400" />
                      <input
                        type="text"
                        placeholder="projeto, sprint, urgente"
                        className="w-full bg-surface-800/50 border border-surface-700 rounded-xl pl-10 pr-4 py-3 text-surface-100 placeholder:text-surface-600 outline-none focus:border-brand-500 transition-all"
                        value={tagsInput}
                        onChange={e => setTagsInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-surface-500 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="size-3" /> Conteúdo
                      </label>
                      <span className={`text-[10px] font-black uppercase tracking-tighter ${charCount > 1000 ? 'text-red-400' : 'text-surface-600'}`}>
                        {charCount} Caracteres
                      </span>
                    </div>
                    <textarea
                      autoFocus
                      className="w-full min-h-[250px] text-lg leading-relaxed text-surface-200 bg-surface-800/30 border border-surface-700 rounded-2xl p-6 outline-none focus:border-brand-500 transition-all placeholder:text-surface-700 resize-none"
                      onChange={handleContentChange}
                      value={content}
                      placeholder="Sua ideia começa aqui..."
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-6 bg-surface-950/30 border-t border-surface-800">
              {isRecording ? (
                <button type="button" onClick={stopRecording} className="w-full flex items-center justify-center gap-4 bg-red-500/10 border border-red-500/20 py-5 rounded-2xl text-red-500 hover:bg-red-500/20 transition-all font-bold group">
                  <div className="size-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  PARAR TRANSCRIÇÃO
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={content === ''}
                  className="w-full bg-brand-600 py-5 rounded-2xl text-center text-sm text-brand-50 outline-none font-bold tracking-widest uppercase hover:bg-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] shadow-lg shadow-brand-500/10 flex items-center justify-center gap-3"
                >
                  <Sparkles className="size-4" />
                  Salvar Nota Inteligente
                </button>
              )}
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}