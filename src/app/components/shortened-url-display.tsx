'use client'

import { useState } from 'react'
import { Button } from "./ui/button"
import { Check, Copy } from 'lucide-react'
import logger from '../lib/logger'

export function ShortenedUrlDisplay({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      logger.error('ShortenedUrlDisplay', 'Failed to copy text: ', err)
    }
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-md">
      <p className="font-semibold mb-2">Shortened URL:</p>
      <div className="flex items-center justify-between">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate mr-2">
          {url}
        </a>
        <Button onClick={copyToClipboard} variant="outline" size="sm">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
