import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, Edit, Trash2, BookOpen } from 'lucide-react'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

interface BookProps {
  id: string
  title: string
  author: string
  rating: number
  currentReadPage: number
  totalPageCount: number
  onDelete: (id: string) => void
}

export default function BookCard({ id, title, author, rating, currentReadPage, totalPageCount, onDelete }: BookProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete book')
      toast({
        title: "Book deleted",
        description: "The book has been successfully removed from your collection.",
        variant: "default",
        className: "bg-white text-black dark:bg-gray-900 dark:text-white",
      })
      onDelete(id)
      // You might want to trigger a refetch of the books list here
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the book. Please try again.",
        variant: "destructive",
        className: "bg-white text-black dark:bg-gray-900 dark:text-white",
      })
    }
    setIsDeleteDialogOpen(false)
  }

  const progress = (currentReadPage / totalPageCount) * 100

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-bold truncate">{title}</CardTitle>
        <CardDescription className="text-sm text-gray-500">{author}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
        <p className="text-sm text-gray-600 mb-4">
          <BookOpen className="inline mr-2 h-4 w-4" />
          Page {currentReadPage} of {totalPageCount}
        </p>
        <div className="flex justify-between">
          <Link href={`/edit-book/${id}`} passHref>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white text-black dark:bg-gray-900 dark:text-white">
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
    </Card>
  )
}