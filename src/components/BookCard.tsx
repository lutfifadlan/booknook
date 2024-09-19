import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import Link from 'next/link'

interface BookProps {
  id: string
  title: string
  author: string
  rating: number
  currentReadPage: number
  totalPageCount: number
}

export default function BookCard({ id, title, author, rating, currentReadPage, totalPageCount }: BookProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-gray-500">{author}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} />
          ))}
        </div>
        <p className="text-sm text-gray-600">Page: {currentReadPage} / {totalPageCount}</p>
        <div className="mt-4 flex justify-between">
          <Link href={`/edit-book/${id}`} passHref>
            <Button variant="outline">Edit</Button>
          </Link>
          <Button variant="destructive">Delete</Button>
        </div>
      </CardContent>
    </Card>
  )
}