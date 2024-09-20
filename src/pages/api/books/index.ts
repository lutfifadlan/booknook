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

  switch (req.method) {
    case 'GET':
      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true }
        })

        if (!user) {
          return res.status(404).json({ error: 'User not found' })
        }

        const books = await prisma.book.findMany({
          where: { userId: user.id }
        })

        return res.status(200).json(books)
      } catch (error) {
        console.error('Error fetching books:', error)
        return res.status(500).json({ error: 'Error fetching books' })
      }

    case 'POST':
      try {
        const { title, author, rating, currentReadPage, totalPageCount } = req.body
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true }
        })
    
        if (!user) {
          return res.status(404).json({ error: 'User not found' })
        }
    
        const newBook = await prisma.book.create({
          data: {
            title,
            author,
            rating: parseInt(rating),
            currentReadPage: parseInt(currentReadPage),
            totalPageCount: parseInt(totalPageCount),
            userId: user.id
          }
        })
        return res.status(201).json(newBook)
      } catch (error) {
      console.error('Error adding book:', error)
      return res.status(500).json({ error: 'Error adding book' })
    }

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}