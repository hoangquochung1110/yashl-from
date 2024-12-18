import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import "./globals.css";


export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_CLIENT_DOMAIN || 'https://localhost:3000'),
  title: 'Yet another url shortener',
  description: 'Yet another url shortener',
  openGraph: {
    title: 'Title webtsite',
    description: 'this is the desciption',
    image: 'url/image.png'
  }
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
