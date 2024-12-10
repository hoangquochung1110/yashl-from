"use client"
import { useEffect, useState } from 'react';
import getDestinationUrl from "@/app/lib/getDestinationUrl";
import Head from 'next/head'


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

  return (
    <>
      <Head>
        <title>A product of Yashl</title>
        <meta property="og:title" content="A Product of Yashl" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.reddit.com/r/aws/comments/d9ksyx/running_binaries_in_lambda/" />
        <meta property="og:image" content="https://hlogs-bucket.s3.ap-southeast-1.amazonaws.com/0Izihh.png" />
      </Head>
    </>
  )}
