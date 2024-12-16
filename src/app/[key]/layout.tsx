import React from 'react';
import RootLayout from '@/app/layout';

export const metadata = {
    title: 'A product of Hung Hoang',
    description: 'A product of Hung Hoang',
    openGraph: {
        title: 'A product of Hung Hoang',
        description: 'A product of Hung Hoang',
        url: 'https://www.reddit.com/r/aws/comments/d9ksyx/running_binaries_in_lambda/',
        siteName: 'reddit.com',
        images: [
          {
            url: 'https://hlogs-bucket.s3.ap-southeast-1.amazonaws.com/0Izihh.png', // Must be an absolute URL
            width: 800,
            height: 600,
          }
        ],
        locale: 'en_US',
        type: 'website',
      },
};


// type Params = {
//   params: {
//     key: string
//   }
// }


// Dynamic metadata
// export async function generateMetadata({ params: { key } }: Params) {

//   // fetch data
//   const product = await fetch(`http://localhost:3001/products/${id}`);
//   const resMetadata = await product.json();

//   return {
//     title: resMetadata.title,
//     description: resMetadata.description,
//   };
// }

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
