export default async function getDestinationUrl(shortUrl: string) {
    console.log(`${process.env.NEXT_PUBLIC_BASE_URL}/${shortUrl}`)
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/${shortUrl}`)

    if (!res.ok) throw new Error('Failed to fetch destination URL')
    return res.json()
}
