'use server'

import { createKey } from "./apiService";

export default async function shortenUrl(formData: FormData): Promise<{ shortPath: string; shortUrl: string }> {
  const url = formData.get('url') as string;
  const uid = formData.get('uid') as string;
  
  if (!url) {
    throw Error("URL is required");
  }

  try {

    const response = await createKey(url, uid);
    const shortPath = response.data.short_path;
    const shortUrl = `${process.env.NEXT_PUBLIC_CLIENT_DOMAIN}/${shortPath}`;

    return { shortPath, shortUrl };
  } catch (error) {
    throw new Error(`Failed to shorten URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
