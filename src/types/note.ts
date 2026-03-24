export interface NoteHistory {
  date: Date
  content: string
}

export type NoteCategory = 'Geral' | 'Trabalho' | 'Estudo' | 'Pessoal' | 'Ideias';

export interface Note {
  id: string
  title: string
  date: Date
  updatedAt: Date
  content: string
  category: NoteCategory
  tags: string[]
  isFavorite: boolean
  history: NoteHistory[]
}
