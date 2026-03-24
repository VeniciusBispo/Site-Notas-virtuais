import { useState, useEffect, useMemo, useCallback } from 'react'
import { Note, NoteCategory } from '../types/note'
import { NoteStorageService } from '../services/storage'

export type SortOption = 'recent' | 'old' | 'favorite';

export function useNotes() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [notes, setNotes] = useState<Note[]>(() => NoteStorageService.getAll())
  
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | 'Todas'>('Todas')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filterFavorites, setFilterFavorites] = useState(false)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(handler)
  }, [search])

  useEffect(() => {
    NoteStorageService.saveAll(notes)
  }, [notes])

  const createNote = useCallback((content: string, title?: string, category: NoteCategory = 'Geral', tags: string[] = []) => {
    setNotes((prevNotes) => {
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: title || 'Sem título',
        date: new Date(),
        updatedAt: new Date(),
        content,
        category,
        tags,
        isFavorite: false,
        history: []
      }
      return [newNote, ...prevNotes]
    })
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes((prevNotes) => prevNotes.filter(note => note.id !== id))
  }, [])

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes((prevNotes) => prevNotes.map(note => {
      if (note.id === id) {
        const historyEntry = { date: note.updatedAt, content: note.content }
        const newHistory = [historyEntry, ...note.history].slice(0, 5)
        
        return { 
          ...note, 
          ...updates, 
          updatedAt: new Date(),
          history: updates.content !== undefined && updates.content !== note.content 
            ? newHistory 
            : note.history
        }
      }
      return note
    }))
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setNotes((prevNotes) => prevNotes.map(note => 
      note.id === id ? { ...note, isFavorite: !note.isFavorite } : note
    ))
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearch(query)
  }, [])

  // Data Portability Actions
  const exportNotes = useCallback((format: 'json' | 'txt') => {
    if (format === 'json') NoteStorageService.exportToJson(notes)
    else NoteStorageService.exportToTxt(notes)
  }, [notes])

  const importNotes = useCallback((jsonData: string) => {
    try {
      const importedNotes = JSON.parse(jsonData)
      const hydratedNotes = importedNotes.map((note: any) => ({
        ...note,
        date: new Date(note.date),
        updatedAt: new Date(note.updatedAt || note.date),
        history: (note.history || []).map((h: any) => ({ ...h, date: new Date(h.date) }))
      }))
      setNotes(hydratedNotes)
      return true
    } catch (e) {
      console.error('Falha ao importar notas:', e)
      return false
    }
  }, [])

  const filteredAndSortedNotes = useMemo(() => {
    let result = [...notes]

    if (debouncedSearch !== '') {
      const lowerSearch = debouncedSearch.toLocaleLowerCase()
      result = result.filter(note => 
        note.content.toLocaleLowerCase().includes(lowerSearch) ||
        note.title.toLocaleLowerCase().includes(lowerSearch) ||
        note.tags.some(tag => tag.toLocaleLowerCase().includes(lowerSearch))
      )
    }

    if (selectedCategory !== 'Todas') {
      result = result.filter(note => note.category === selectedCategory)
    }

    if (filterFavorites) {
      result = result.filter(note => note.isFavorite)
    }

    result.sort((a, b) => {
      if (sortBy === 'favorite') {
        if (a.isFavorite === b.isFavorite) return b.date.getTime() - a.date.getTime()
        return a.isFavorite ? -1 : 1
      }
      if (sortBy === 'old') return a.date.getTime() - b.date.getTime()
      return b.date.getTime() - a.date.getTime()
    })

    return result
  }, [notes, debouncedSearch, selectedCategory, sortBy, filterFavorites])

  return {
    notes: filteredAndSortedNotes,
    allNotes: notes, // Still need raw notes for export
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
  }
}
