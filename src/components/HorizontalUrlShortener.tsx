import { useState, useEffect } from 'react';

// Example URLs for demonstration
const exampleUrls = [
  {
    long: 'amazon.com/products/electronics/headphones/wireless-noise-cancelling-bluetooth-over-ear',
    short: 'urlshr.io/aX7bQ'
  },
  {
    long: 'medium.com/technology/the-future-of-ai-and-machine-learning-in-web-development-trends',
    short: 'urlshr.io/k9Pzt'
  },
  {
    long: 'github.com/user/awesome-javascript-libraries/tree/main/documentation/examples',
    short: 'urlshr.io/mR3eF'
  },
  {
    long: 'linkedin.com/jobs/search/remote-developer-positions/senior-level/united-states/california',
    short: 'urlshr.io/b8Lwq'
  },
  {
    long: 'youtube.com/watch?v=javascript-advanced-concepts-tutorial-for-developers-2023',
    short: 'urlshr.io/p2Yjx'
  },
  {
    long: 'nytimes.com/2023/04/15/technology/artificial-intelligence-development-ethics-guidelines',
    short: 'urlshr.io/g7Hds'
  },
  {
    long: 'coursera.org/specializations/web-development/frontend-frameworks/react-advanced',
    short: 'urlshr.io/t6Vpk'
  },
  {
    long: 'stackoverflow.com/questions/65432198/how-to-optimize-react-performance-with-usememo',
    short: 'urlshr.io/z5Nrw'
  },
  {
    long: 'twitter.com/programming/status/the-evolution-of-javascript-frameworks-2023-analysis',
    short: 'urlshr.io/j4Mcd'
  },
  {
    long: 'docs.google.com/spreadsheets/d/marketing-campaign-analytics-q2-2023/edit#gid=0',
    short: 'urlshr.io/v3Tbh'
  }
];

// Generate additional URLs
const generateMoreUrls = (count: number) => { // Add type annotation for count
  const domains = ['facebook.com', 'instagram.com', 'netflix.com', 'spotify.com', 'airbnb.com', 
                   'dropbox.com', 'slack.com', 'trello.com', 'notion.so', 'figma.com'];
  
  const paths = ['/users/profile', '/dashboard/analytics', '/settings/account', '/help/faq', 
                 '/search/results', '/products/new', '/blog/latest', '/events/upcoming'];
  
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  const result = [];
  
  for (let i = 0; i < count; i++) {
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];
    const queryParams = '?' + Array(3).fill(null).map(() => { // Use null with fill for clarity
      const paramName = Array(5).fill(null).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
      const paramValue = Array(8).fill(null).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
      return `${paramName}=${paramValue}`;
    }).join('&');
    
    const longUrl = domain + path + queryParams;
    
    // Generate short code
    const shortCode = Array(5).fill(null).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    
    result.push({
      long: longUrl,
      short: 'urlshr.io/' + shortCode
    });
  }
  
  return result;
};

// Combine example URLs with generated ones - Generate more
const allUrls = [...exampleUrls, ...generateMoreUrls(40)];

// Define URL type
interface UrlData {
  long: string;
  short: string;
}

// Increase number of active items
const NUM_ACTIVE_ITEMS = 20; 

const HorizontalUrlShortener: React.FC = () => { 
  const [activeUrls, setActiveUrls] = useState<UrlData[]>([]); 
  
  useEffect(() => {
    setActiveUrls(allUrls.slice(0, NUM_ACTIVE_ITEMS));
    
    const interval = setInterval(() => {
      setActiveUrls(prev => {
        const availableUrls = allUrls.filter(url => !prev.some(activeUrl => activeUrl.short === url.short)); 
        if (availableUrls.length === 0) return prev; 
        const newUrl = availableUrls[Math.floor(Math.random() * availableUrls.length)];
        const updated = [...prev, newUrl];
        if (updated.length > NUM_ACTIVE_ITEMS) {
          updated.shift(); 
        }
        return updated;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Render multiple rows for vertical fill
  const renderScrollingRow = (rowIndex: number) => (
    <div key={rowIndex} className={`flex py-2 ${rowIndex % 2 === 0 ? 'animate-scroll' : 'animate-scroll-reverse'}`}> 
      {[...activeUrls, ...activeUrls].map((url, index) => (
        <div 
          key={`${url.short}-${rowIndex}-${index}`} 
          // Styles for individual items
          className="flex-none mx-4 w-64 p-2 whitespace-nowrap"
        >
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={url.long}>
            {url.long}
          </div>
          <div className="flex items-center mt-1">
            <svg className="h-3 w-3 text-indigo-400 dark:text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="ml-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 truncate">{url.short}</span>
          </div>
        </div>
      ))}
    </div>
  );
  
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {Array.from({ length: 15 }).map((_, i) => renderScrollingRow(i))}
    </div>
  );
};

export default HorizontalUrlShortener; 