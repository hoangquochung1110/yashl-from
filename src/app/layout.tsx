import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import "./globals.css";


export const metadata = {
  title: 'Yet another url shortener',
  description: 'Yet another url shortener',
};


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
