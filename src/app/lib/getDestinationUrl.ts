export default async function getDestinationUrl(key: string) {
    const res = await fetch(`https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/${key}`)

    if (!res.ok) throw new Error('Failed to fetch destination URL')
    return res.json()
}
