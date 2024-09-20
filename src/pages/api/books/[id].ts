import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { id } = req.query

  switch (req.method) {
    case 'GET':
      try {
        const book = await prisma.book.findUnique({
          where: { id: id as string, userId: session.user.id }
        })
        if (!book) {
          return res.status(404).json({ error: 'Book not found' })
        }
        return res.status(200).json(book)
      } catch (error) {
        console.error('Error fetching book:', error)
        return res.status(500).json({ error: 'Error fetching book' })
      }

    case 'PUT':
      try {
        const { title, author, rating, currentReadPage, totalPageCount } = req.body
        const updatedBook = await prisma.book.update({
          where: { id: id as string, userId: session.user.id },
          data: {
            title,
            author,
            rating: parseInt(rating),
            currentReadPage: parseInt(currentReadPage),
            totalPageCount: parseInt(totalPageCount)
          }
        })
        return res.status(200).json(updatedBook)
      } catch (error) {
        console.error('Error updating book:', error)
        return res.status(500).json({ error: 'Error updating book' })
      }

    case 'DELETE':
      try {
        await prisma.book.delete({
          where: { id: id as string, userId: session.user.id }
        })
        return res.status(204).end()
      } catch (error) {
        console.error('Error deleting book:', error)
        return res.status(500).json({ error: 'Error deleting book' })
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}