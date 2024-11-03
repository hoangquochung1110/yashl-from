import Link from 'next/link'

interface UrlEntry {
  shortUrl: string;
  destinationUrl: string;
  clickCount: number;
}

// This is mock data - you'll want to replace this with actual data from your backend
const mockUrls: UrlEntry[] = [
  {
    shortUrl: 'yt52k',
    destinationUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    clickCount: 127
  },
  {
    shortUrl: 'gh39x',
    destinationUrl: 'https://github.com/features/actions',
    clickCount: 43
  },
  {
    shortUrl: 'nf20p',
    destinationUrl: 'https://netflix.com/browse',
    clickCount: 89
  },
  {
    shortUrl: 'tw15m',
    destinationUrl: 'https://twitter.com/elonmusk/status/1234567890',
    clickCount: 256
  },
  {
    shortUrl: 'docs7',
    destinationUrl: 'https://docs.google.com/document/d/1234567890/edit',
    clickCount: 15
  },
  {
    shortUrl: 'blog2',
    destinationUrl: 'https://medium.com/technology/how-to-build-a-url-shortener',
    clickCount: 32
  }
]

export default function ManageUrls() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Shortened URLs</h1>
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Home
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shortened URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Click Count
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockUrls.map((url, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a 
                      href={`/${url.shortUrl}`}
                      className="text-blue-600 hover:text-blue-800"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {url.shortUrl}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap truncate max-w-xs">
                    {url.destinationUrl}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {url.clickCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
} 