'use client'

import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import shortenUrl from '@/app/lib/generateKey';
import { useAuth } from '../contexts/AuthContext';
import { takeScreenshot } from '../lib/apiService';
import ScreenshotPreview from './screenshot-preview';
import { ShortenedUrlDisplay } from './shortened-url-display';

export function UrlShortenerForm() {
  const [shortUrl, setShortUrl] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScreenshotLoading, setIsScreenshotLoading] = useState(false);
  const [enableScreenshot, setEnableScreenshot] = useState(false);
  
  const { user } = useAuth();

  async function handleSubmit(formData: FormData) {
    try {
      setIsLoading(true);
      setError(null);
      setScreenshot(null);

      // Add user ID if available
      const originalUrl = formData.get('url') as string;
      const newFormData = new FormData();
      newFormData.append('url', originalUrl);
      newFormData.append('uid', user?.uid || '');

      const data = await shortenUrl(newFormData);
      setShortUrl(data.shortUrl);
      setIsLoading(false);

      // Generate screenshot if enabled
      if (enableScreenshot) {
        try {
          setIsScreenshotLoading(true);
          
          const response = await takeScreenshot(
            data.shortPath, 
            originalUrl
          );
          
          if (!response || !response.s3ObjectUrl) {
            throw new Error('Failed to generate screenshot: Invalid response from server');
          }
          setScreenshot(response.s3ObjectUrl);
        } catch (error) {
          console.error('Screenshot error:', error);
          
          // Format user-friendly error message
          let errorMessage = 'Failed to generate screenshot';
          
          if (error instanceof Error) {
            if (error.message.includes('timed out') || error.message.includes('504')) {
              errorMessage = 'The screenshot is taking too long to generate. Your URL has been shortened successfully, but we couldn\'t create a preview image.';
            } else {
              errorMessage = `Screenshot error: ${error.message}`;
            }
          }
          
          setError(errorMessage);
          setScreenshot(null);
        } finally {
          setIsScreenshotLoading(false);
        }
      }
    } catch (error) {
      console.error('URL shortening error:', error);
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setScreenshot(null);
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
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSubmit(formData);
        }}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="url">Destination URL</Label>
              <Input id="url" name="url" placeholder="https://example.com/very/long/url" required />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="screenshot" 
                checked={enableScreenshot}
                onCheckedChange={(checked) => setEnableScreenshot(!!checked)}
              />
              <Label htmlFor="screenshot">Generate Preview Screenshot</Label>
            </div>
          </div>
          <Button className="w-full mt-4" type="submit" disabled={isLoading || isScreenshotLoading}>
            {isLoading ? 'Shortening...' : isScreenshotLoading ? 'Generating Preview...' : 'Shorten URL'}
          </Button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {shortUrl && <ShortenedUrlDisplay url={shortUrl} />}
        {(isLoading || isScreenshotLoading) ? (
          <div className="flex flex-col justify-center items-center p-4">
            <svg className="animate-spin h-10 w-10 text-blue-600 mb-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <p className="text-sm text-gray-500">
              {isLoading ? 'Shortening URL...' : 'Generating screenshot preview...'}
            </p>
          </div>
        ) : screenshot && (
          <ScreenshotPreview imageUrl={screenshot} />
        )}
      </CardContent>
    </Card>
  );
}
