import { NewNoteCard } from './components/new-note-card'
import { NoteCard } from './components/note-card'
import { useNotes } from './hooks/use-notes'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles, Filter, ListFilter, Star, Grid2X2, Database, Download, Upload, FileJson, FileText as FileTextIcon } from 'lucide-react'
import { NoteCategory } from './types/note'
import * as Popover from '@radix-ui/react-popover'
import { toast } from 'sonner'
import { ChangeEvent, useRef } from 'react'

const CATEGORIES: (NoteCategory | 'Todas')[] = ['Todas', 'Geral', 'Trabalho', 'Estudo', 'Pessoal', 'Ideias']

export function App() {
  const { 
    notes, 
    search, 
    selectedCategory, 
    sortBy, 
    filterFavorites,
    createNote, 
    deleteNote, 
    updateNote,
    toggleFavorite,
    handleSearch,
    exportNotes,
    importNotes,
    setSelectedCategory,
    setSortBy,
    setFilterFavorites
  } = useNotes()

  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const success = importNotes(content)
      if (success) {
        toast.success('Notas importadas com sucesso!')
      } else {
        toast.error('Erro ao importar arquivo. Verifique o formato.')
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }

  return (
    <div className="mx-auto max-w-7xl my-16 space-y-10 px-6 lg:px-8">
      {/* Header Section */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-surface-50">
              Notas<span className="text-brand-500">.</span>
            </h1>
            <p className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <Sparkles className="size-3 text-brand-500" />
              Productivity Suite
            </p>
          </div>
        </div>

        <div className="flex-1 w-full md:max-w-xl flex items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
            <input
              type="text"
              placeholder="Busque por textos, títulos ou tags..."
              className="w-full bg-surface-900/50 border border-surface-800 rounded-2xl py-5 pl-12 pr-4 text-lg font-medium tracking-tight outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 placeholder:text-surface-700 transition-all shadow-xl"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
            />
          </div>

          <Popover.Root>
            <Popover.Trigger asChild>
              <button className="bg-surface-900 border border-surface-800 p-4 rounded-2xl text-surface-400 hover:text-brand-400 hover:border-brand-500/30 transition-all shadow-xl active:scale-95 group">
                <Database className="size-6 group-hover:rotate-12 transition-transform" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className="z-50 w-64 bg-surface-900 border border-surface-800 rounded-2xl p-2 shadow-2xl animate-in fade-in zoom-in duration-200" sideOffset={10}>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-surface-600 uppercase tracking-widest px-4 py-2 border-b border-surface-800 mb-2">Gestão de Dados</p>
                  
                  <button onClick={() => { exportNotes('json'); toast.info('Exportando JSON...'); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-surface-300 hover:bg-surface-800 hover:text-surface-50 rounded-xl transition-all">
                    <FileJson className="size-4 text-brand-400" /> Exportar JSON (Backup)
                  </button>
                  
                  <button onClick={() => { exportNotes('txt'); toast.info('Exportando TXT...'); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-surface-300 hover:bg-surface-800 hover:text-surface-50 rounded-xl transition-all">
                    <FileTextIcon className="size-4 text-blue-400" /> Exportar Texto (.txt)
                  </button>

                  <div className="h-px bg-surface-800 mx-4 my-2" />

                  <button onClick={handleImportClick} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-surface-300 hover:bg-surface-800 hover:text-surface-50 rounded-xl transition-all">
                    <Upload className="size-4 text-green-400" /> Importar Backup
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                </div>
                <Popover.Arrow className="fill-surface-800" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </motion.header>

      {/* Advanced Toolbar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-surface-900/40 p-2 rounded-2xl border border-surface-800/50"
      >
        <div className="flex items-center gap-1 overflow-x-auto w-full lg:w-auto no-scrollbar p-1">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === category 
                ? 'bg-brand-500 text-brand-50 shadow-lg shadow-brand-500/20' 
                : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto px-2">
          <div className="h-8 w-px bg-surface-800 hidden lg:block" />
          
          <button 
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filterFavorites 
              ? 'bg-yellow-400/10 border-yellow-400/50 text-yellow-400' 
              : 'border-surface-800 text-surface-500 hover:border-surface-700'
            }`}
          >
            <Star className={`size-4 ${filterFavorites ? 'fill-current' : ''}`} />
            Favoritos
          </button>

          <div className="flex items-center gap-2 bg-surface-950/50 rounded-xl p-1 border border-surface-800">
            <ListFilter className="size-4 text-surface-600 ml-2" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-surface-300 outline-none pr-4 py-1.5 cursor-pointer hover:text-surface-100 transition-colors"
            >
              <option value="recent">Mais Recentes</option>
              <option value="old">Mais Antigas</option>
              <option value="favorite">Destaque Favoritos</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Grid Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-sm font-black text-surface-500 uppercase tracking-widest flex items-center gap-2">
             <Grid2X2 className="size-4" /> Quadros de Notas
           </h2>
           <span className="text-[10px] font-bold text-brand-500 bg-brand-500/10 px-2 py-1 rounded-md">
             {notes.length} Resultados
           </span>
        </div>

        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 auto-rows-[300px]"
        >
          <NewNoteCard onNoteCreated={createNote} />

          <AnimatePresence mode="popLayout">
            {notes.map((note) => (
              <NoteCard 
                key={note.id} 
                note={note} 
                onNoteDeleted={deleteNote}
                onNoteUpdated={updateNote}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Empty State */}
      {notes.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <div className="bg-surface-900 border border-surface-800 p-10 rounded-full mb-8 shadow-2xl">
            <Filter className="size-16 text-surface-800" />
          </div>
          <h3 className="text-2xl font-black text-surface-100 tracking-tight">Nenhum resultado para os filtros atuais</h3>
          <p className="text-surface-600 mt-2 font-medium">Experimente mudar a categoria ou limpar sua busca.</p>
          <button 
            onClick={() => { setSelectedCategory('Todas'); handleSearch(''); setFilterFavorites(false); }}
            className="mt-8 text-brand-500 font-bold hover:underline uppercase text-xs tracking-widest"
          >
            Limpar todos os filtros
          </button>
        </motion.div>
      )}
    </div>
  )
}
