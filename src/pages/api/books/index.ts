import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  switch (req.method) {
    case 'GET':
      try {
        const books = await prisma.book.findMany({
          where: { userId: session.user.id }
        })
        return res.status(200).json(books)
      } catch (error) {
        console.error('Error fetching books:', error)
        return res.status(500).json({ error: 'Error fetching books' })
      }

    case 'POST':
      try {
        const { title, author, rating, currentReadPage, totalPageCount } = req.body
        const newBook = await prisma.book.create({
          data: {
            title,
            author,
            rating: parseInt(rating),
            currentReadPage: parseInt(currentReadPage),
            totalPageCount: parseInt(totalPageCount),
            userId: session.user.id
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