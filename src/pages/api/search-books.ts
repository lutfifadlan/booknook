import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes'
const OPEN_LIBRARY_API_URL = 'https://openlibrary.org/search.json'

interface OpenLibraryItem {
  title: string;
  author_name?: string[];
  first_sentence?: string;
  ratings_average?: number;
  first_publish_year?: number;
  number_of_pages_median?: number;
  language?: string[];
}

interface Book {
  volumeInfo: {
    title: string;
    authors: string[];
    description: string;
    averageRating: number;
    publishedDate: string;
    pageCount: number;
    language: string;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { query, dataSource, page = '1', pageSize = '10' } = req.query

  try {
    let result
    if (dataSource === 'googleBooks') {
      result = await searchGoogleBooks(query as string, Number(page), Number(pageSize))
    } else if (dataSource === 'openLibrary') {
      result = await searchOpenLibrary(query as string, Number(page), Number(pageSize))
    } else {
      return res.status(400).json({ error: 'Invalid data source' })
    }

    res.status(200).json(result)
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'Error searching books' })
  }
}

async function searchGoogleBooks(query: string, page: number, pageSize: number) {
  const startIndex = (page - 1) * pageSize
  const response = await axios.get(GOOGLE_BOOKS_API_URL, {
    params: { 
      q: query, 
      key: GOOGLE_API_KEY,
      startIndex,
      maxResults: pageSize
    }
  })

  const books = response.data.items?.map((item: Book) => ({
    title: item.volumeInfo.title,
    authors: item.volumeInfo.authors || [],
    description: item.volumeInfo.description || '',
    rating: item.volumeInfo.averageRating || 0,
    publishedDate: item.volumeInfo.publishedDate || 'N/A',
    pageCount: item.volumeInfo.pageCount || 0,
    language: item.volumeInfo.language || 'N/A'
  })) || []

  return {
    books,
    totalItems: response.data.totalItems
  }
}

async function searchOpenLibrary(query: string, page: number, pageSize: number) {
  const response = await axios.get(OPEN_LIBRARY_API_URL, {
    params: { 
      q: query,
      page,
      limit: pageSize
    }
  })

  const books = response.data.docs.map((item: OpenLibraryItem) => ({
    title: item.title,
    authors: item.author_name || [],
    description: item.first_sentence || '',
    rating: item.ratings_average || 0,
    publishedDate: item.first_publish_year || 'N/A',
    pageCount: item.number_of_pages_median || 0,
    language: item.language ? item.language[0] : 'N/A'
  }))

  return {
    books,
    totalItems: response.data.numFound
  }
}