import { useSession } from 'next-auth/react'
import { useQuery } from 'react-query'
import { Button } from '@/components/ui/button'
import BookCard from '@/components/BookCard'
import Link from 'next/link'

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

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Welcome to Booknook</h1>
        <p className="mb-4">Please login to use Booknook.</p>
        <Link href="/login" passHref>
          <Button>Login</Button>
        </Link>
      </div>
    )
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>An error occurred: {(error as Error).message}</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Books</h1>
      {books && books.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book: Book) => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>
      ) : (
        <p>No books added yet.</p>
      )}
      <div className="mt-8">
        <Link href="/add-book" passHref>
          <Button>Add Book</Button>
        </Link>
      </div>
      <div className="mt-10 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Find Your Next Read</h2>
        <p className="text-gray-600 mb-6">Explore our vast collection of books and find your next favorite.</p>
        <Link href="/search-book" passHref>
          <Button>Search Books</Button>
        </Link>
      </div>
    </div>
  )
}