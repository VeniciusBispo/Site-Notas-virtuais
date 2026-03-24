import { Note } from '../types/note'

const STORAGE_KEY = 'notes'

function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const NoteStorageService = {
  getAll(): Note[] {
    const notesJson = localStorage.getItem(STORAGE_KEY)
    if (!notesJson) return []
    
    try {
      const parsedNotes = JSON.parse(notesJson)
      return parsedNotes.map((note: any) => ({
        ...note,
        date: new Date(note.date),
        updatedAt: new Date(note.updatedAt || note.date),
        history: (note.history || []).map((h: any) => ({ ...h, date: new Date(h.date) }))
      }))
    } catch {
      return []
    }
  },

  saveAll(notes: Note[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  },

  exportToJson(notes: Note[]): void {
    const dataStr = JSON.stringify(notes, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    downloadFile(blob, `backup-notas-${new Date().getTime()}.json`)
  },

  exportToTxt(notes: Note[]): void {
    const content = notes.map(note => (
      `Título: ${note.title}\n` +
      `Data: ${new Date(note.date).toLocaleString()}\n` +
      `Categoria: ${note.category}\n` +
      `Tags: ${note.tags.join(', ')}\n` +
      `----------------------------------------\n` +
      `${note.content}\n\n` +
      `========================================\n\n`
    )).join('')
    
    const blob = new Blob([content], { type: 'text/plain' })
    downloadFile(blob, `notas-export-${new Date().getTime()}.txt`)
  }
}
