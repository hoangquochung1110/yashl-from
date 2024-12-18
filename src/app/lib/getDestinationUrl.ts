export default async function getDestinationUrl(key: string) {
    console.log(`${process.env.NEXT_PUBLIC_RESOLVE_KEY_URL}/${key}`)
    const res = await fetch(`${process.env.NEXT_PUBLIC_RESOLVE_KEY_URL}/${key}`)

    if (!res.ok) throw new Error('Failed to fetch destination URL')
    return res.json()
}
