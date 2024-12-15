'use client';

import Link from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute';
import listKeys from '../lib/listKeys';


interface UrlEntry {
  shortUrl: string;
  destinationUrl: string;
  clickCount: number;
}

// This is mock data - you'll want to replace this with actual data from your backend
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';


export default function ManageUrls() {
  const [user, setUser] = useState<User | null>(null);

  const [urls, setUrls] = useState<null | UrlEntry[]>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const response = await listKeys(user?.uid as string);
        const data = JSON.parse(response.body);
        const urls: UrlEntry[] = data.map((item: { key_id: string, user_id: string, shorten_path: string, destination_url: string, click_count: string }) => ({
          shortUrl: `${process.env.NEXT_PUBLIC_CLIENT_DOMAIN}/${item.shorten_path}`,
          destinationUrl: item.destination_url,
          clickCount: parseInt(item.click_count, 10),
        }));
          setUrls(urls);
          setLoading(false);
      } catch (error) {
        console.error('Error fetching URLs:', error);
      }
    };

    if (user?.uid) {
      fetchUrls();
    }
  }, [user?.uid]);

  return (
    <ProtectedRoute>
         <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Shortened URLs</h1>
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Home
          </Link>
        </div>

        <div className="rounded-lg overflow-hidden">
          {loading ? (
            <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shortened URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Click Count
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {urls?.map((url, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a 
                        href={`${url.shortUrl}`}
                        className="text-blue-600 hover:text-blue-800"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {url.shortUrl}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap truncate max-w-xs">
                      {url.destinationUrl}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {url.clickCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
    </ProtectedRoute>
  );
} 