'use client'

import React, { useEffect, useState } from 'react';
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { shortenUrl } from '../actions'
import { ShortenedUrlDisplay } from './shortened-url-display'
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';


export function UrlShortenerForm() {
  const [shortUrl, setShortUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        console.log("User is signed in:", user.uid);
      } else {
        setUser(null);
        console.log("User is signed out");
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  async function handleSubmit(formData: FormData) {
    formData.append('uid', user?.uid as string)
    const result = await shortenUrl(formData)
    if ('error' in result) {
      setError(result.error ?? 'An unknown error occurred')
      setShortUrl(null)
    } else {
      setShortUrl(result.shortUrl)
      setError(null)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>URL Shortener</CardTitle>
        <CardDescription>Enter a long URL to get a shortened version</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="url">Destination URL</Label>
              <Input id="url" name="url" placeholder="https://example.com/very/long/url" required />
            </div>
          </div>
          <Button className="w-full mt-4" type="submit">Shorten URL</Button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {shortUrl && <ShortenedUrlDisplay url={shortUrl} />}
      </CardContent>
    </Card>
  )
}
