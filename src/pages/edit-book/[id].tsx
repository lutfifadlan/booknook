import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function getBook(id: string) {
  const res = await fetch(`/api/books/${id}`)
  if (!res.ok) throw new Error('Failed to fetch book')
  return res.json()
}

async function updateBook(id: string, bookData: { title: string; author: string; rating: number; currentReadPage: number; totalPageCount: number }) {
  const res = await fetch(`/api/books/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookData),
  })
  if (!res.ok) throw new Error('Failed to update book')
  return res.json()
}

async function deleteBook(id: string) {
  const res = await fetch(`/api/books/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete book')
  return res.json()
}

export default function EditBook() {
  const router = useRouter()
  const { id } = router.query
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [rating, setRating] = useState(0)
  const [currentReadPage, setCurrentReadPage] = useState(0)
  const [totalPageCount, setTotalPageCount] = useState(0)

  const { data: book, isLoading, error } = useQuery(['book', id], () => getBook(id as string), {
    enabled: !!id,
  })

  useEffect(() => {
    if (book) {
      setTitle(book.title)
      setAuthor(book.author)
      setRating(book.rating)
      setCurrentReadPage(book.currentReadPage)
      setTotalPageCount(book.totalPageCount)
    }
  }, [book])

  const updateMutation = useMutation((bookData: { title: string; author: string; rating: number; currentReadPage: number; totalPageCount: number }) => updateBook(id as string, bookData), {
    onSuccess: () => {
      queryClient.invalidateQueries(['book', id])
      router.push('/')
    },
  })

  const deleteMutation = useMutation(() => deleteBook(id as string), {
    onSuccess: () => {
      queryClient.invalidateQueries('books')
      router.push('/')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({ title, author, rating, currentReadPage, totalPageCount })
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this book?')) {
      deleteMutation.mutate()
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>An error occurred: {(error as Error).message}</div>

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Book</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                Author
              </label>
              <Input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                Rating
              </label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                required
              />
            </div>
            <div>
              <label htmlFor="currentReadPage" className="block text-sm font-medium text-gray-700">
                Current Read Page
              </label>
              <Input
                id="currentReadPage"
                type="number"
                min="0"
                value={currentReadPage}
                onChange={(e) => setCurrentReadPage(parseInt(e.target.value))}
                required
              />
            </div>
            <div>
              <label htmlFor="totalPageCount" className="block text-sm font-medium text-gray-700">
                Total Page Count
              </label>
              <Input
                id="totalPageCount"
                type="number"
                min="1"
                value={totalPageCount}
                onChange={(e) => setTotalPageCount(parseInt(e.target.value))}
                required
              />
            </div>
            <div className="flex justify-between">
              <Button type="submit">Update Book</Button>
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Delete Book
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}