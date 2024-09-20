import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery } from 'react-query'
import { Star, Search, Loader2, BookPlus } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface Book {
  title: string
  authors: string[]
  description: string
  rating: number
  publishedDate: string
  pageCount: number
  language: string
}

interface SearchResponse {
  books: Book[]
  totalItems: number
}

async function searchBooks(query: string, dataSource: string, page: number, pageSize: number) {
  const res = await fetch(`/api/search-books?query=${query}&dataSource=${dataSource}&page=${page}&pageSize=${pageSize}`)
  if (!res.ok) throw new Error('Failed to fetch books')
  return res.json()
}

export default function SearchBook() {
  const [query, setQuery] = useState('')
  const [dataSource, setDataSource] = useState('googleBooks')
  const [page, setPage] = useState(1)
  const pageSize = 9 // Number of items per page
  const { toast } = useToast()
  const [totalPages, setTotalPages] = useState(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [addingBookId, setAddingBookId] = useState<string | null>(null)

  const { data, refetch, isLoading, error } = useQuery<SearchResponse>(
    ['searchBooks', query, dataSource, page],
    () => searchBooks(query, dataSource, page, pageSize),
    { 
      enabled: false,
      onSuccess: (data) => {
        const newTotalPages = Math.max(1, Math.ceil(data.totalItems / pageSize))
        setTotalPages(newTotalPages)
        if (data.books.length === 0 && page > 1) {
          // If current page is empty and it's not the first page, go to the first page
          setPage(1)
          refetch()
        }
      }
    }
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      toast({
        title: "Search query is empty",
        description: "Please enter a search term",
        variant: "destructive",
        duration: 3000,
      })
      return
    }
    setPage(1) // Reset to first page on new search
    setHasSearched(true)
    refetch()
  }

  const handleAddBook = async (book: Book) => {
    setAddingBookId(book.title) // Use book title as a unique identifier
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: book.title,
          author: book.authors.join(', '),
          rating: book.rating,
          totalPageCount: book.pageCount,
          currentReadPage: 1
        }),
      })
      if (!response.ok) throw new Error('Failed to add book')
      toast({
        title: "Book added successfully",
        description: `"${book.title}" has been added to your collection`,
        variant: "default",
        className: "bg-white text-black dark:bg-gray-900 dark:text-white",
        duration: 3000,
      })
    } catch (error) {
      console.error('Error adding book:', error)
      toast({
        title: "Failed to add book",
        description: "An error occurred while adding the book",
        variant: "destructive",
        className: "bg-white text-black dark:bg-gray-900 dark:text-white",
        duration: 3000,
      })
    } finally {
      setAddingBookId(null)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage)
      refetch()
    }
  }

  const renderPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const leftOffset = Math.max(1, page - Math.floor(maxVisiblePages / 2))
      const rightOffset = Math.min(totalPages, leftOffset + maxVisiblePages - 1)

      if (leftOffset > 1) {
        pages.push(1)
        if (leftOffset > 2) pages.push('ellipsis')
      }

      for (let i = leftOffset; i <= rightOffset; i++) {
        pages.push(i)
      }

      if (rightOffset < totalPages) {
        if (rightOffset < totalPages - 1) pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages.map((pageNum, index) => {
      if (pageNum === 'ellipsis') {
        return (
          <PaginationItem key={`ellipsis-${index}`}>
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
      return (
        <PaginationItem key={pageNum}>
          <PaginationLink 
            onClick={() => handlePageChange(pageNum as number)}
            isActive={page === pageNum}
            className={`cursor-pointer ${page === pageNum ? 'pointer-events-none' : ''}`}
          >
            {pageNum}
          </PaginationLink>
        </PaginationItem>
      )
    })
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
            <SelectItem value="googleBooks" className="cursor-pointer">Google Books</SelectItem>
            <SelectItem value="openLibrary" className="cursor-pointer">Open Library</SelectItem>
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

      {error ? (
        <p className="text-center text-red-500 mb-8">An error occurred: {(error as Error).message}</p>
      ) : <div/>}

      {!isLoading && hasSearched && (!data || data.books.length === 0) && (
        <p className="text-center text-gray-500 mb-8">No books found. Try a different search term or page.</p>
      )}

      {data && data.books.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {data.books.map((book, index) => (
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
                  <Button 
                    onClick={() => handleAddBook(book)} 
                    className="mt-4 w-full"
                    disabled={addingBookId === book.title}
                  >
                    <div className="flex items-center justify-center">
                      {addingBookId === book.title ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <BookPlus className="mr-2 h-4 w-4" />
                      )}
                      {addingBookId === book.title ? 'Adding...' : 'Add to My Books'}
                    </div>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(page - 1)}
                    className={page === 1 ? 'cursor-not-allowed opacity-50 pointer-events-none' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {renderPageNumbers()}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(page + 1)}
                    className={page === totalPages ? 'cursor-not-allowed opacity-50 pointer-events-none' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  )
}