import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery } from 'react-query'
import { Star, Search, Loader2, BookPlus } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface Book {
  title: string
  authors: string[]
  description: string
  rating: number
  publishedDate: string
  pageCount: number
  language: string
}

async function searchBooks(query: string, dataSource: string) {
  const res = await fetch(`/api/search-books?query=${query}&dataSource=${dataSource}`)
  if (!res.ok) throw new Error('Failed to fetch books')
  return res.json()
}

export default function SearchBook() {
  const [query, setQuery] = useState('')
  const [dataSource, setDataSource] = useState('googleBooks')
  const { toast } = useToast()
  const { data: books, refetch, isLoading, error } = useQuery<Book[]>(
    ['searchBooks', query, dataSource],
    () => searchBooks(query, dataSource),
    { enabled: false }
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      toast({
        title: "Search query is empty",
        description: "Please enter a search term",
        variant: "destructive",
      })
      return
    }
    refetch()
  }

  const handleAddBook = async (book: Book) => {
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: book.title,
          author: book.authors.join(', '),
          rating: book.rating,
          totalPageCount: book.pageCount,
          currentReadPage: 0
        }),
      })
      if (!response.ok) throw new Error('Failed to add book')
      toast({
        title: "Book added successfully",
        description: `"${book.title}" has been added to your collection`,
        variant: "default",
        className: "bg-white text-black dark:bg-gray-900 dark:text-white",
      })
    } catch (error) {
      console.error('Error adding book:', error)
      toast({
        title: "Failed to add book",
        description: "An error occurred while adding the book",
        variant: "destructive",
        className: "bg-white text-black dark:bg-gray-900 dark:text-white",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Book Search</h1>
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for books by title or author..."
          className="w-full md:w-96"
        />
        <Select value={dataSource} onValueChange={setDataSource}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Select data source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="googleBooks">Google Books</SelectItem>
            <SelectItem value="openLibrary">Open Library</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" className="w-full md:w-auto">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          Search
        </Button>
      </form>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-black dark:text-white" />
        </div>
      )}

      { error ? (
        <p className="text-center text-red-500 mb-8">An error occurred: {(error as Error).message}</p>
      ) : <div/>}

      {!isLoading && books && books.length === 0 && (
        <p className="text-center text-gray-500 mb-8">No books found. Try a different search term.</p>
      )}

      {books && books.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book, index) => (
            <Card key={index} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                <p className="text-sm text-gray-500">{book.authors.join(', ')}</p>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <div>
                  <p className="text-sm mb-2 line-clamp-3">{book.description}</p>
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.round(book.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill={i < Math.round(book.rating) ? 'currentColor' : 'none'}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{book.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-gray-600">Published: {book.publishedDate}</p>
                  <p className="text-sm text-gray-600">Pages: {book.pageCount}</p>
                  <p className="text-sm text-gray-600">Language: {book.language}</p>
                </div>
                <Button onClick={() => handleAddBook(book)} className="mt-4 w-full">
                  <BookPlus className="mr-2 h-4 w-4" />
                  Add to My Books
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Toaster />
    </div>
  )
}