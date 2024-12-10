"use client"
import { useEffect, useState } from 'react';
import getDestinationUrl from "@/app/lib/getDestinationUrl";

type Params = {
  params: {
    key: string
  }
}

export default function ResolvePage({ params: { key } }: Params) {
  const [destinationUrl, setDestinationUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchDestinationUrl = async () => {
      try {
        const destinationUrlData = getDestinationUrl(key);
        const [urlData] = await Promise.all([destinationUrlData]);
        
        // Set the destination URL in state
        setDestinationUrl(urlData.destination_url);
      } catch (error) {
        console.error("Error fetching destination URL:", error);
      }
    };

    fetchDestinationUrl();
  }, [key]);

  useEffect(() => {
    if (destinationUrl) {
      // Redirect to the destination URL
      window.location.href = destinationUrl;
    }
  }, [destinationUrl]);

  return null; // No need to render anything as we're redirecting
}
