import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, Save, Trash2 } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

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
  const { toast } = useToast()

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [rating, setRating] = useState(0)
  const [currentReadPage, setCurrentReadPage] = useState(0)
  const [totalPageCount, setTotalPageCount] = useState(0)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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

  const updateMutation = useMutation(
    (bookData: { title: string; author: string; rating: number; currentReadPage: number; totalPageCount: number }) => 
      updateBook(id as string, bookData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['book', id])
        toast({
          title: "Book updated",
          description: "Your changes have been saved successfully.",
          variant: "default",
          duration: 3000,
        })
        setTimeout(() => router.push('/'), 100)
      },
      onError: () => {
        toast({
          title: "Update failed",
          description: "There was an error updating the book. Please try again.",
          variant: "destructive",
          duration: 3000,
        })
      },
    }
  )

  const deleteMutation = useMutation(() => deleteBook(id as string), {
    onSuccess: () => {
      queryClient.invalidateQueries('books')
      toast({
        title: "Book deleted",
        description: "The book has been removed from your collection.",
        variant: "default",
      })
      setTimeout(() => router.push('/'), 100)
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "There was an error deleting the book. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({ title, author, rating, currentReadPage, totalPageCount })
  }

  const handleDelete = () => {
    setIsDeleteDialogOpen(false)
    deleteMutation.mutate()
  }

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  )
  if (error) return (
    <div className="text-center text-red-500 mt-8">
      An error occurred: {(error as Error).message}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Book</CardTitle>
          <CardDescription>Update the details of your book</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentReadPage">Current Read Page</Label>
              <Input
                id="currentReadPage"
                type="number"
                min="0"
                value={currentReadPage}
                onChange={(e) => setCurrentReadPage(parseInt(e.target.value))}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalPageCount">Total Page Count</Label>
              <Input
                id="totalPageCount"
                type="number"
                min="1"
                value={totalPageCount}
                onChange={(e) => setTotalPageCount(parseInt(e.target.value))}
                required
                className="w-full"
              />
            </div>
            <div className="flex justify-between pt-4">
              <Button type="submit" disabled={updateMutation.isLoading} className="w-32">
                {updateMutation.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(true)} className="w-32">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this book?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the book
              &quot;{title}&quot; from your collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}