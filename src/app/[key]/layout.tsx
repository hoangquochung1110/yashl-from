import React from 'react';
import RootLayout from '@/app/layout';
import getDestinationUrl from '@/app/lib/getDestinationUrl';

type Params = {
  params: {
    key: string
  }
}


// Dynamic metadata
export async function generateMetadata({ params: { key } }: Params) {

  // fetch data
  const screenshotPreview = "https://hlogs-bucket.s3.ap-southeast-1.amazonaws.com/j3qMEe.png";
  const { destinationUrl} = await getDestinationUrl(key);

  return {
    // title: resMetadata.title,
    // description: resMetadata.description,
    title: 'A product of Hung Hoang',
    description: 'A product of Hung Hoang',
    openGraph: {
        title: 'A product of Hung Hoang',
        description: 'A product of Hung Hoang',
        url: destinationUrl,
        siteName: 'reddit.com',
        images: [
          {
            url: screenshotPreview, // Must be an absolute URL
            width: 800,
            height: 600,
          }
        ],
        locale: 'en_US',
        type: 'website',
      },
  };
}

export default function ResolvePageLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
  return (
    <RootLayout
    >{children}
    </RootLayout>
  );
}
