import * as Dialog from '@radix-ui/react-dialog'
import { X, Trash2, Calendar, Maximize2, Star, Edit3, History, Hash, LayoutGrid, Save, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { memo, useState, ChangeEvent } from 'react'
import { Note, NoteCategory } from '../types/note'
import { formatRelativeDate } from '../utils/date-formatter'
import { toast } from 'sonner'

interface NoteCardProps {
  note: Note
  onNoteDeleted: (id: string) => void
  onNoteUpdated: (id: string, updates: Partial<Note>) => void
  onToggleFavorite: (id: string) => void
}

const CATEGORIES: NoteCategory[] = ['Geral', 'Trabalho', 'Estudo', 'Pessoal', 'Ideias']

function NoteCardComponent({ note, onNoteDeleted, onNoteUpdated, onToggleFavorite }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [viewHistory, setViewHistory] = useState(false)
  
  // Edit state
  const [editedContent, setEditedContent] = useState(note.content)
  const [editedTitle, setEditedTitle] = useState(note.title)
  const [editedCategory, setEditedCategory] = useState(note.category)
  const [editedTags, setEditedTags] = useState(note.tags.join(', '))

  function handleSaveEdit() {
    const tags = editedTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    onNoteUpdated(note.id, {
      content: editedContent,
      title: editedTitle,
      category: editedCategory,
      tags
    })
    setIsEditing(false)
    toast.success('Nota atualizada!')
  }

  function handleCancelEdit() {
    setEditedContent(note.content)
    setEditedTitle(note.title)
    setEditedCategory(note.category)
    setEditedTags(note.tags.join(', '))
    setIsEditing(false)
  }

  return (
    <Dialog.Root onOpenChange={(open) => { if(!open) { setIsEditing(false); setViewHistory(false); } }}>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -5 }}
        className="h-full"
      >
        <Dialog.Trigger className="group relative flex flex-col w-full h-full text-left glass-card rounded-2xl p-6 gap-4 overflow-hidden outline-none transition-all hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 focus-visible:ring-2 focus-visible:ring-brand-500">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                note.category === 'Trabalho' ? 'bg-blue-500/10 text-blue-400' :
                note.category === 'Estudo' ? 'bg-purple-500/10 text-purple-400' :
                note.category === 'Pessoal' ? 'bg-green-500/10 text-green-400' :
                'bg-brand-500/10 text-brand-400'
              }`}>
                {note.category}
              </span>
              <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">
                {formatRelativeDate(note.date)}
              </span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(note.id); }}
              className={`p-1.5 rounded-lg transition-all ${note.isFavorite ? 'text-yellow-400 bg-yellow-400/10' : 'text-surface-600 hover:text-surface-400'}`}
            >
              <Star className={`size-4 ${note.isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-surface-100 line-clamp-1 group-hover:text-brand-400 transition-colors">
              {note.title}
            </h3>
            <p className="text-sm leading-relaxed text-surface-400 line-clamp-4 group-hover:text-surface-200 transition-colors">
              {note.content}
            </p>
          </div>

          <div className="flex flex-wrap gap-1 mt-auto">
            {note.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] text-surface-500 flex items-center gap-0.5">
                <Hash className="size-2" /> {tag}
              </span>
            ))}
            {note.tags.length > 3 && <span className="text-[10px] text-surface-600">+{note.tags.length - 3}</span>}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface-950/60 to-transparent pointer-events-none" />
        </Dialog.Trigger>
      </motion.div>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-surface-950/80 backdrop-blur-md z-40" />
        <Dialog.Content className="fixed overflow-hidden z-50 inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:h-[80vh] md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[750px] w-full bg-surface-900 border border-surface-800 md:rounded-3xl shadow-2xl flex flex-col outline-none animate-in fade-in zoom-in duration-300">
          
          <div className="absolute top-4 right-4 z-10 flex gap-2">
             {!isEditing && !viewHistory && (
               <>
                 <button onClick={() => setViewHistory(true)} className="bg-surface-800/50 hover:bg-brand-500/20 hover:text-brand-400 p-2 rounded-full text-surface-400 transition-all"><History className="size-5" /></button>
                 <button onClick={() => setIsEditing(true)} className="bg-surface-800/50 hover:bg-brand-500/20 hover:text-brand-400 p-2 rounded-full text-surface-400 transition-all"><Edit3 className="size-5" /></button>
               </>
             )}
             <Dialog.Close className="bg-surface-800/50 hover:bg-red-500/20 hover:text-red-400 p-2 rounded-full text-surface-400 transition-all active:scale-95"><X className="size-5" /></Dialog.Close>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-6">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div key="edit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="space-y-4">
                    <input value={editedTitle} onChange={e => setEditedTitle(e.target.value)} className="w-full bg-transparent text-2xl font-black text-surface-50 border-b border-surface-800 focus:border-brand-500 outline-none pb-2 transition-colors" placeholder="Título da nota" />
                    <div className="grid grid-cols-2 gap-4">
                      <select value={editedCategory} onChange={e => setEditedCategory(e.target.value as NoteCategory)} className="bg-surface-800/50 border border-surface-700 rounded-xl px-4 py-2 text-sm text-surface-100 outline-none focus:border-brand-500 transition-all">
                        {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-surface-900">{cat}</option>)}
                      </select>
                      <input value={editedTags} onChange={e => setEditedTags(e.target.value)} className="bg-surface-800/50 border border-surface-700 rounded-xl px-4 py-2 text-sm text-surface-100 outline-none focus:border-brand-500 transition-all" placeholder="Tags separaradas por vírgula" />
                    </div>
                    <textarea value={editedContent} onChange={e => setEditedContent(e.target.value)} className="w-full min-h-[300px] bg-surface-800/20 border border-surface-700 rounded-2xl p-6 text-lg text-surface-200 outline-none focus:border-brand-500 transition-all resize-none" />
                  </div>
                </motion.div>
              ) : viewHistory ? (
                <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 h-full">
                  <button onClick={() => setViewHistory(false)} className="flex items-center gap-2 text-brand-400 text-sm font-bold hover:underline mb-6"><ArrowLeft className="size-4" /> Voltar</button>
                  <h3 className="text-xl font-black text-surface-50">Histórico de Edições</h3>
                  <div className="space-y-4">
                    {note.history.length === 0 ? (
                      <p className="text-surface-500 italic">Nenhuma versão anterior encontrada.</p>
                    ) : (
                      note.history.map((entry, idx) => (
                        <div key={idx} className="glass-card p-4 rounded-xl space-y-2 border-l-4 border-l-brand-500">
                          <span className="text-[10px] font-bold text-surface-600 uppercase tracking-widest">{formatRelativeDate(entry.date)}</span>
                          <p className="text-sm text-surface-300 line-clamp-3 leading-relaxed">{entry.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-brand-500/10 text-brand-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {note.category}
                      </span>
                      <span className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">
                        Criada em {new Date(note.date).toLocaleDateString('pt-BR')} às {new Date(note.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h2 className="text-4xl font-black text-surface-50 tracking-tight leading-tight">{note.title}</h2>
                    <div className="flex flex-wrap gap-2">
                       {note.tags.map(tag => (
                         <span key={tag} className="flex items-center gap-1 bg-surface-800 text-surface-400 px-2 py-0.5 rounded-md text-[10px] font-bold border border-surface-700"><Hash className="size-3" /> {tag}</span>
                       ))}
                    </div>
                  </div>
                  <p className="text-lg leading-relaxed text-surface-200 whitespace-pre-wrap font-medium border-l-2 border-brand-500/30 pl-6">
                    {note.content}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 bg-surface-950/50 border-t border-surface-800">
            {isEditing ? (
              <div className="grid grid-cols-2 gap-4">
                <button onClick={handleCancelEdit} className="py-4 rounded-2xl text-center text-sm text-surface-400 bg-surface-800 hover:bg-surface-700 transition-all font-black uppercase tracking-widest">Cancelar</button>
                <button onClick={handleSaveEdit} className="py-4 rounded-2xl text-center text-sm text-brand-50 bg-brand-600 hover:bg-brand-500 transition-all font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"><Save className="size-4" /> Salvar Alterações</button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onNoteDeleted(note.id)}
                className="w-full flex items-center justify-center gap-3 py-5 text-xs text-red-500/60 hover:text-red-400 hover:bg-red-400/5 transition-all outline-none font-black uppercase tracking-[0.2em] group"
              >
                <Trash2 className="size-4" />
                Eliminar Registro Permanentemente
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export const NoteCard = memo(NoteCardComponent)