'use server'
import aws4 from "aws4";
import https from "https";

// Enable debug mode in development
const DEBUG = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_DEBUG === 'true';

const host = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;
const service = 'execute-api';
const region = process.env.AWS_REGION || 'ap-southeast-1';

// Increase default timeout for screenshot-related requests
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const SCREENSHOT_TIMEOUT = 120000; // 2 minutes for screenshot endpoints

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
};

// Debug logging utility
function debugLog(...args: unknown[]) {
  if (DEBUG) {
    console.log('[API Debug]', ...args);
  }
}

interface ApiRequestOptions {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  queryParams?: Record<string, string>;
  timeout?: number;
}

interface ApiResponse<T> {
  statusCode: number;
  data: T;
}

export async function apiRequest<T>({ 
  path, 
  method = 'GET', 
  body, 
  queryParams,
  timeout 
}: ApiRequestOptions): Promise<ApiResponse<T>> {
  // Validate environment variables
  if (!host) {
    throw new Error('Missing NEXT_PUBLIC_BACKEND_DOMAIN environment variable');
  }
  
  if (!credentials.accessKeyId || !credentials.secretAccessKey) {
    throw new Error('Missing AWS credentials (AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY)');
  }

  // Auto-detect timeout based on endpoint
  if (!timeout) {
    timeout = path.includes('/screenshots') ? SCREENSHOT_TIMEOUT : DEFAULT_TIMEOUT;
  }

  // Append query parameters if provided
  let requestPath = path;
  if (queryParams && Object.keys(queryParams).length > 0) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      if (value) searchParams.append(key, value);
    }
    
    const queryString = searchParams.toString();
    if (queryString) {
      const separator = requestPath.includes('?') ? '&' : '?';
      requestPath = `${requestPath}${separator}${queryString}`;
    }
  }

  const options = {
    hostname: host,
    path: requestPath,
    method,
    headers: {
      'Host': host,
      'Content-Type': 'application/json',
    },
  };

  const bodyString = body ? JSON.stringify(body) : undefined;

  try {
    debugLog(`Request: ${method} ${host}${requestPath}`);
    if (body) {
      debugLog(`Request body:`, body);
    }
    debugLog(`Request timeout: ${timeout}ms`);
    
    const signer = aws4.sign({
      service,
      region,
      host,
      path: requestPath,
      headers: options.headers,
      method,
      body: bodyString,
    }, {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    });
    
    Object.assign(options.headers, signer.headers);
    
    // Only log headers in debug mode to avoid exposing credentials
    debugLog(`Signed headers:`, options.headers);

    const response = await new Promise<{statusCode?: number, body: string}>((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            body: responseBody
          });
        });
      });

      req.on('error', (e) => {
        console.error(`[API] Network error: ${e.message}`);
        reject(new Error(`Network error: ${e.message}`));
      });

      // Set a timeout to prevent hanging requests
      req.setTimeout(timeout, () => {
        console.error(`[API] Request timed out after ${timeout}ms: ${method} ${host}${requestPath}`);
        req.destroy();
        reject(new Error(`Request timed out after ${timeout}ms`));
      });

      if (bodyString) {
        req.write(bodyString);
      }
      req.end();
    });

    // Check for error status codes
    if (response.statusCode && response.statusCode >= 400) {
      console.error(`[API] Error response (${response.statusCode}): ${response.body}`);
      let errorMessage = `Request failed with status ${response.statusCode}`;
      try {
        const errorData = JSON.parse(response.body);
        if (errorData && errorData.message) {
          errorMessage += `: ${errorData.message}`;
        }
      } catch {
        // If we can't parse the error response, just use the status code
        if (response.body) {
          errorMessage += `: ${response.body}`;
        }
      }
      throw new Error(errorMessage);
    }

    // Parse response
    try {
      debugLog(`Response status: ${response.statusCode}`);
      debugLog(`Response body:`, response.body.length > 200 
        ? response.body.substring(0, 200) + '...' 
        : response.body);
      
      const data = JSON.parse(response.body) as T;
      return { 
        statusCode: response.statusCode || 200,
        data 
      };
    } catch (parseError) {
      console.error(`[API] Failed to parse response: ${response.body.substring(0, 200)}`);
      throw new Error(`Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  } catch(err) {
    // Rethrow with a more specific error message
    if (err instanceof Error) {
      throw err; // Keep original error if it's already well-formed
    }
    throw new Error(`API request error: Unknown error`);
  }
}

// Additional debugging utility to check API connectivity
// Pseudo code for health check
export async function checkApiHealth() {
  try {
    debugLog('Checking API health...');
    const result = await apiRequest({
      path: '/health',
      method: 'GET'
    });
    
    debugLog('API health check result:', result);
    return result;
  } catch (error) {
    console.error('[API] Health check failed:', error);
    throw error;
  }
}

// Define interface for the listKeys response
interface ListKeysResponse {
  keys: Array<{
    key_id: string;
    user_id: string;
    short_path: string;
    target_url: string;
    hits: string;
  }>;
}

// Define interface for the createKey response
interface CreateKeyResponse {
  user_id: string;
  title: string;
  description: string;
  target_url: string;
  segments: Array<Record<string, unknown>>;
  key_id: number;
  short_path: string;
  hits: number;
  short_url: string;
}

// Define interface for screenshot API response
interface ScreenshotApiResponse {
  message: string;
  data: {
    url: string;
    message: string;
  };
}

export interface TakeScreenshotResponse {
  s3ObjectUrl: string;
}

// Maximum number of retries for taking a screenshot
const MAX_RETRIES = 2;
// Delay between retries in milliseconds (3 seconds)
const RETRY_DELAY = 3000;

/**
 * Delay execution for a specified amount of time
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper functions for common API operations
export async function listKeys(userId: string) {
  if (!userId) {
    throw new Error('User ID is required to list keys');
  }
  
  debugLog(`Listing keys for user: ${userId}`);
  return apiRequest<ListKeysResponse>({
    path: '/key',
    method: 'GET',
    queryParams: { user_id: userId }
  });
}

export async function createKey(targetUrl: string, userId: string) {
  if (!targetUrl) {
    throw new Error('Target URL is required');
  }
  
  debugLog(`Creating key for URL: ${targetUrl}`);
  return apiRequest<CreateKeyResponse>({
    path: '/key',
    method: 'POST',
    body: { 
      target_url: targetUrl,
      user_id: userId
    }
  });
}

/**
 * Takes a screenshot of a URL and returns the S3 URL of the image
 */
export async function takeScreenshot(
  shortPath: string, 
  url: string
): Promise<TakeScreenshotResponse> {
  if (!shortPath || !url) {
    throw new Error('Both shortPath and URL are required for screenshots');
  }

  debugLog(`Taking screenshot for URL: ${url}, shortPath: ${shortPath}`);
  
  let lastError: Error | null = null;
  let retryCount = 0;

  // Try to take screenshot with retries
  while (retryCount <= MAX_RETRIES) {
    try {
      debugLog(`Attempt ${retryCount + 1}/${MAX_RETRIES + 1} for ${url}`);
      
      const response = await apiRequest<ScreenshotApiResponse>({
        path: '/screenshots',
        method: 'POST',
        body: { 
          target_url: url, 
          short_path: shortPath 
        },
        // Use a longer timeout for screenshot requests
        timeout: 120000 // 2 minutes
      });

      if (!response.data.data?.url) {
        throw new Error('Screenshot URL not found in response');
      }

      debugLog(`Successfully generated screenshot for ${url}: ${response.data.data.url}`);
      return { s3ObjectUrl: response.data.data.url };
    } catch (error) {
      lastError = error instanceof Error 
        ? error 
        : new Error('Unknown screenshot error');
      
      if (lastError.message.includes('504') || lastError.message.includes('timed out')) {
        // This is a timeout error, we can retry
        console.warn(`[Screenshot] Timeout error, retrying (${retryCount + 1}/${MAX_RETRIES}): ${lastError.message}`);
        debugLog(`Timeout error details:`, lastError);
        retryCount++;
        
        if (retryCount <= MAX_RETRIES) {
          // Wait before retrying
          debugLog(`Waiting ${RETRY_DELAY}ms before retry ${retryCount}`);
          await delay(RETRY_DELAY);
          continue;
        }
      } else {
        // For other errors, don't retry
        console.error(`[Screenshot] Non-retryable error: ${lastError.message}`);
        debugLog(`Non-retryable error details:`, lastError);
        break;
      }
    }
  }

  // If we've exhausted all retries or got a non-retryable error
  const errorMessage = lastError?.message || 'Unknown error';
  console.error(`[Screenshot] All attempts failed: ${errorMessage}`);
  
  // Provide a more detailed error message
  if (errorMessage.includes('504')) {
    throw new Error(`Screenshot service timed out. The server took too long to generate the screenshot. Try again later or check if the URL is accessible.`);
  } else {
    throw new Error(`Screenshot service error: ${errorMessage}`);
  }
}