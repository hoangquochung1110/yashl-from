'use client'

import shortenUrl from '@/app/lib/generateKey';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { takeScreenshot, TakeScreenshotResponse } from '../lib/screenshot';
import ScreenshotPreview from './screenshot-preview';
import { ShortenedUrlDisplay } from './shortened-url-display';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";


export function UrlShortenerForm() {
  const [shortUrl, setShortUrl] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

    return () => unsubscribe();
  }, []);

  async function handleSubmit(formData: FormData) {
    formData.append('uid', user?.uid as string)
    try {
      setIsLoading(true);
      const data = await shortenUrl(formData);

      // Validate shortenUrl response before proceeding
      if (!data || !data.shortPath || !data.shortUrl) {
        throw new Error('Failed to generate short URL: Invalid response from server');
      }

      // Set shortUrl only after validation
      setShortUrl(data.shortUrl);

      try {
        const response: TakeScreenshotResponse = await takeScreenshot(data.shortPath, formData.get('url') as string);
        console.log("response of takeScreenshot", response);
        // Proceed with screenshot only if we have a valid key
        if (!response || !response.s3ObjectUrl) {
          throw new Error('Failed to generate screenshot: Invalid response from server');
        }
        console.log('Screenshot URL:', response.s3ObjectUrl);
        setScreenshot(response.s3ObjectUrl);
      } catch (error) {
        setError(String(error));
        setScreenshot(null);
      }
    } catch (error) {
      setError(String(error));
      setScreenshot(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>URL Shortener</CardTitle>
        <CardDescription>Enter a long URL to get a shortened version</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => {
          e.preventDefault(); // Prevent default form submission
          const formData = new FormData(e.currentTarget); // Create FormData from the form
          handleSubmit(formData); // Call handleSubmit with FormData
        }}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="url">Destination URL</Label>
              <Input id="url" name="url" placeholder="https://example.com/very/long/url" required />
            </div>
          </div>
          <Button className="w-full mt-4" type="submit" disabled={isLoading}>
            {isLoading ? 'Shortening...' : 'Shorten URL'}
          </Button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {shortUrl && <ShortenedUrlDisplay url={shortUrl} />}
        {isLoading ? (
          <div className="flex justify-center items-center p-4">
            <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </div>
        ) : screenshot && (
            <ScreenshotPreview imageUrl={screenshot} />
        )}
      </CardContent>
    </Card>
  )
}
