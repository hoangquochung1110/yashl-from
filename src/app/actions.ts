'use server'

import { nanoid } from 'nanoid'

// In a real application, this would be a database
const urlMap = new Map<string, string>()

export async function shortenUrl(formData: FormData) {
  const url = formData.get('url') as string
  
  if (!url) {
    return { error: 'URL is required' }
  }

  try {
    new URL(url)
  } catch {
    return { error: 'Invalid URL' }
  }

  const shortKey = nanoid(6) // Generate a 6-character key
  
  // In a real application, we would check if the key already exists in the database
  // and generate a new one if it does
  
  urlMap.set(shortKey, url)

  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${shortKey}`
  return { shortUrl }
}
