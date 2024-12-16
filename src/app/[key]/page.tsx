"use client"
import { useEffect, useState } from 'react';
import getDestinationUrl from "@/app/lib/getDestinationUrl";
import takeScreenshot from '@/app/lib/screenshot';


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
    if (destinationUrl && key) {
      // Call takeScreenshot when destinationUrl is set
      takeScreenshot(key, destinationUrl)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.error("Error taking screenshot:", error);
          // Optionally handle the error, e.g., redirect anyway
          window.location.href = destinationUrl;
        });
    }
  }, [destinationUrl, key]);

  return (
    <>
    </>
  )}
