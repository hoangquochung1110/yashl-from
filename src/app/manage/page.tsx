'use client';

import Link from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute';
import { listKeys } from '../lib/apiService';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import logger from '../lib/logger';

interface UrlEntry {
  shortUrl: string;
  destinationUrl: string;
  clickCount: number;
}

export default function ManageUrls() {
  const { user } = useAuth();
  const [urls, setUrls] = useState<UrlEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrls = async () => {
      if (!user?.uid) return;
      
      try {
        const response = await listKeys(user.uid);
        const data = response.data;
        
        // Check if data.keys exists and is an array before mapping
        if (!data || !data.keys || !Array.isArray(data.keys)) {
          logger.error('ManageUrls', 'Unexpected API response format:', data);
          setUrls([]);
          setLoading(false);
          return;
        }
        
        const urls: UrlEntry[] = data.keys.map((item: { key_id: string, user_id: string, short_path: string, target_url: string, hits: string }) => ({
          shortUrl: `${process.env.NEXT_PUBLIC_CLIENT_DOMAIN}/${item.short_path}`,  // TODO: server should return shortUrl
          destinationUrl: item.target_url,
          clickCount: parseInt(item.hits, 10),
        }));
        setUrls(urls);
      } catch (error) {
        logger.error('ManageUrls', 'Error fetching URLs:', error);
        setUrls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();
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
              <div className="flex justify-center py-10">
                <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
            ) : urls.length === 0 ? (
              <div className="bg-white p-8 text-center">
                <p className="text-gray-500">You don&apos;t have any shortened URLs yet.</p>
                <Link 
                  href="/" 
                  className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-800"
                >
                  Create a Shortened URL
                </Link>
              </div>
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
                  {urls.map((url, index) => (
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