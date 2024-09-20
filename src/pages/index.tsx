import { useSession } from 'next-auth/react'
import { useQuery } from 'react-query'
import { Button } from '@/components/ui/button'
import BookCard from '@/components/BookCard'
import Link from 'next/link'
import { PlusCircle, Search, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEffect, useState } from 'react'

interface Book {
  id: string;
  title: string;
  author: string;
  rating: number;
  currentReadPage: number;
  totalPageCount: number;
}

async function getBooks(): Promise<Book[]> {
  const res = await fetch('/api/books')
  if (!res.ok) throw new Error('Failed to fetch books')
  return res.json()
}

export default function Home() {
  const { data: session } = useSession()
  const { data: books, isLoading, error } = useQuery<Book[]>('books', getBooks)
  const [localBooks, setLocalBooks] = useState<Book[]>([])

  useEffect(() => {
    if (books) {
      setLocalBooks(books)
    }
  }, [books])


  const handleDelete = (deletedId: string) => {
    setLocalBooks(prevBooks => prevBooks.filter(book => book.id !== deletedId))
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <h1 className="text-4xl font-bold mb-4 text-black dark:text-white">Welcome to Booknook</h1>
        <p className="mb-8 text-gray-600 dark:text-gray-300">Your personal library management system</p>
        <Link href="/login" passHref>
          <Button size="lg">Login to Get Started</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Books</h1>
        <Link href="/add-book" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Book
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to fetch books. Please try again later.
          </AlertDescription>
        </Alert>
      ) : localBooks && localBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localBooks.map((book: Book) => (
            <BookCard key={book.id} {...book} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <Alert>
          <AlertTitle>No books found</AlertTitle>
          <AlertDescription>
            You haven&apos;t added any books yet. Click the Add Book button to get started.
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Find Your Next Read</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Explore our vast collection of books and find your next favorite.</p>
        <Link href="/search-book" passHref className="mb-6">
          <Button size="lg">
            <Search className="mr-2 h-5 w-5" /> Search Books
          </Button>
        </Link>
      </div>
    </div>
  )
}