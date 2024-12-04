import getDestinationUrl from "@/app/lib/getDestinationUrl"


type Params = {
  params: {
    key: string
  }
}

export default async function ResolvePage({ params: { key } }: Params) {
  const destinationUrlData = getDestinationUrl(key)
  const [destinationUrl] = await Promise.all([destinationUrlData])
  return (
    <div>{destinationUrl.destination_url}</div>
  )
}
