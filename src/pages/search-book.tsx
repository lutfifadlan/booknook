import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery } from 'react-query'
import { Star } from 'lucide-react'

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
  const { data: books, refetch, isLoading, error } = useQuery<Book[]>(
    ['searchBooks', query, dataSource],
    () => searchBooks(query, dataSource),
    { enabled: false }
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
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
      alert('Book added successfully!')
    } catch (error) {
      console.error('Error adding book:', error)
      alert('Failed to add book')
    }
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-6">Book Search</h1>
      <form onSubmit={handleSearch} className="flex justify-center space-x-4 mb-8">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for books by title or author..."
          className="w-96"
        />
        <Select value={dataSource} onValueChange={setDataSource}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select data source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="googleBooks">Google Books</SelectItem>
            <SelectItem value="openLibrary">Open Library</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit">Search</Button>
      </form>

      {isLoading && <p className="text-center">Loading...</p>}

      {
        error ?
          <p className="text-center text-red-500">An error occurred: {(error as Error).message}</p>
          : <div/>
      }

      {!isLoading && books && books.length === 0 && <p className="text-center">No books</p>}

      {books && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{book.title}</CardTitle>
                <p className="text-sm text-gray-500">{book.authors.join(', ')}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">{book.description.substring(0, 150)}...</p>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < book.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">Published: {book.publishedDate}</p>
                <p className="text-sm text-gray-600">Pages: {book.pageCount}</p>
                <p className="text-sm text-gray-600">Language: {book.language}</p>
                <Button onClick={() => handleAddBook(book)} className="mt-4">
                  Add to My Books
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}