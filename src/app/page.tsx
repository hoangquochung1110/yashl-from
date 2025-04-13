'use client';

import { UrlShortenerForm } from './components/url-shortener-form'
import Link from 'next/link'
import React, { useEffect, useState } from 'react';
import { auth } from './lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import logger from './lib/logger';
import HorizontalUrlShortener from '@/components/HorizontalUrlShortener';


export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        logger.debug('Auth', "User is signed in:", user.uid);
      } else {
        logger.debug('Auth', "User is signed out");
      }
      setUser(user);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  return (
    <main className="relative min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40">
        <HorizontalUrlShortener />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center">
        <UrlShortenerForm />
      </div>

      <div className="absolute top-0 right-0 p-4 z-10">
        {user ? ( 
          <p className="text-gray-800 dark:text-gray-200">Hi {user.displayName}</p>
        ) : (
          <Link
            href="/login"
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-800"
          >
            Login
          </Link>
        )}
      </div>
    </main>
  )
}
