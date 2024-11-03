import { UrlShortenerForm } from './components/url-shortener-form'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <UrlShortenerForm />
      <Link 
        href="/manage" 
        className="mt-4 text-blue-600 hover:text-blue-800 underline"
      >
        Manage URLs
      </Link>
    </main>
  )
}
