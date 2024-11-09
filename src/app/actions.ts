'use server'

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

  const response = await fetch('https://3zrw4n9tgb.execute-api.ap-southeast-1.amazonaws.com/Dev/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      destination_url: url
    }),
  })

  const data = await response.json()
  const shortKey= JSON.parse(data.body) // Take the key from the response body
  // In a real application, we would check if the key already exists in the database
  // and generate a new one if it does
  urlMap.set(shortKey, url)

  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${shortKey}`
  return { shortUrl }
}
