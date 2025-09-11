import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Book, SearchResult } from '../types'

export const useBookStore = defineStore('book', () => {
  const searchResults = ref<SearchResult[]>([])
  const currentBook = ref<Book | null>(null)
  const catalog = ref<string[]>([])
  const isSearching = ref(false)
  const searchQuery = ref('')

  const setSearchResults = (results: SearchResult[]) => {
    searchResults.value = results
  }

  const setCurrentBook = (book: Book) => {
    currentBook.value = book
  }

  const setCatalog = (catalogData: string[]) => {
    catalog.value = catalogData
  }

  const clearSearch = () => {
    searchResults.value = []
    searchQuery.value = ''
  }

  return {
    searchResults,
    currentBook,
    catalog,
    isSearching,
    searchQuery,
    setSearchResults,
    setCurrentBook,
    setCatalog,
    clearSearch,
  }
})