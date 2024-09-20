import { useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useMutation } from 'react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface BookData {
  title: string
  author: string
  rating: number
  currentReadPage: number
  totalPageCount: number
}

const addBook = async (bookData: BookData) => {
  const response = await fetch('/api/books', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookData),
  })

  if (!response.ok) {
    throw new Error('Failed to add book')
  }

  return response.json()
}

export default function AddBook() {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [rating, setRating] = useState(4)
  const [currentReadPage, setCurrentReadPage] = useState(1)
  const [totalPageCount, setTotalPageCount] = useState(10)
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const mutation = useMutation(addBook, {
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Book added successfully!",
        className: "bg-white text-black dark:bg-gray-900 dark:text-white",
        duration: 3000,
      })
      router.push('/')
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add book",
        variant: "destructive",
        duration: 3000,
      })
    },
  })

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    router.push('/login')
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      title,
      author,
      rating,
      currentReadPage,
      totalPageCount,
    })
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Add New Book</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentReadPage">Current Page</Label>
              <Input
                id="currentReadPage"
                type="number"
                min="0"
                value={currentReadPage}
                onChange={(e) => setCurrentReadPage(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalPageCount">Total Pages</Label>
              <Input
                id="totalPageCount"
                type="number"
                min="1"
                value={totalPageCount}
                onChange={(e) => setTotalPageCount(Number(e.target.value))}
                required
              />
            </div>
            {mutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {mutation.error instanceof Error ? mutation.error.message : 'An error occurred'}
                </AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={mutation.isLoading}>
              {mutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Book...
                </>
              ) : (
                'Add Book'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}