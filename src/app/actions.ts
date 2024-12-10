'use server'

// In a real application, this would be a database
const urlMap = new Map<string, string>()

export async function shortenUrl(formData: FormData) {
  const url = formData.get('url') as string
  const uid = formData.get('uid') as string
  if (!url) {
    return { error: 'URL is required' }
  }

  try {
    new URL(url)
  } catch {
    return { error: 'Invalid URL' }
  }

  const apiUrl = process.env.NEXT_PUBLIC_SHORTENER_API_URL;
  if (!apiUrl) {
    return { error: 'SHORTENER_API_URL environment variable is not set' };
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      destination_url: url,
      user_id: uid,
    }),
  })
  if (!response.ok) {
    // Handle error based on status code
    if (response.status === 404) {
      return { error: 'API endpoint not found' }
    } else if (response.status === 500) {
      return { error: 'Internal server error' }
    } else {
      return { error: 'Failed to shorten URL' }
    }
  } else {
      const result = await response.json();
      const body = result['body'];
      const shortKey = JSON.parse(body).key;
      urlMap.set(shortKey, url);
      const shortUrl = `${process.env.NEXT_PUBLIC_CLIENT_DOMAIN}/${shortKey}`
      return { shortUrl }
  }
}
