'use client';

import { UrlShortenerForm } from './components/url-shortener-form'
import Link from 'next/link'
import React, { useEffect, useState } from 'react';
import { auth } from './lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';


export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        console.log("User is signed in:", user.uid);
      } else {
        setUser(null);
        console.log("User is signed out");
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <UrlShortenerForm />
      <Link 
        href="/manage" 
        className="mt-4 text-blue-600 hover:text-blue-800 underline"
      >
        Manage URLs
      </Link>
      {user ? (
        <p>Welcome, User ID: {user.uid}</p>
      ) : (
        <Link 
        href="/login" 
        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-800"
      >
        Login
      </Link>
      )}
    </main>
  )
}
