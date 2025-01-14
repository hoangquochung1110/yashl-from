"use server";
import aws4 from "aws4";
import https from "https";
import assumeRole from "@/app/lib/assumeRole";


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

export async function takeScreenshot(shortPath: string, url: string): Promise<TakeScreenshotResponse> {
  const service = 'execute-api';
  const host = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;
  const canonicalURI = '/screenshots';
  const region = process.env.AWS_REGION;

  const options = {
    hostname: host,
    path: canonicalURI,
    method: 'POST',
    headers: {
      'Host': host,
      'Content-Type': 'application/json',
    },
  };

  try {
    const assumeRoleResponse = await assumeRole();
    if (!assumeRoleResponse) {
      throw new Error('Assume role response is undefined');
    }
    
    const { AccessKeyId, SecretAccessKey, SessionToken } = assumeRoleResponse.Credentials ?? {};
    const signer = aws4.sign({
      service: service,
      region: region,
      path: canonicalURI,
      headers: options.headers,
      method: options.method,
      body: JSON.stringify({ target_url: url, short_path: shortPath }),
    }, {
      accessKeyId: AccessKeyId,
      secretAccessKey: SecretAccessKey,
      sessionToken: SessionToken,
    });
    
    Object.assign(options.headers, signer.headers);

    const response = await new Promise<{statusCode?: number, body: string}>((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            body
          });
        });
      });

      req.on('error', (e) => {
        reject(new Error(`Network error: ${e.message}`));
      });

      req.write(JSON.stringify({ target_url: url, short_path: shortPath }));
      req.end();
    });

    // Check for 5xx status codes
    if (response.statusCode && response.statusCode >= 500) {
      throw new Error(`Server error: ${response.statusCode}`);
    }

    // Check for non-200 responses
    if (response.statusCode !== 200) {
      const errorData = JSON.parse(response.body);
      throw new Error(errorData.message || `Request failed with status ${response.statusCode}`);
    }

    console.log("body before parsed", response.body);
    const result: ScreenshotApiResponse = JSON.parse(response.body);
    
    if (!result.data?.url) {
      throw new Error('Screenshot URL not found in response');
    }

    return { s3ObjectUrl: result.data.url };
  } catch(err) {
    throw new Error(`Screenshot service error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

/*
const takeScreenshot = async (key: string, url: string) => {
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 5000)); // Delay of 2 seconds

  console.log("Taking screenshots... (mocked)");

  // Simulate a successful response body
  const mockResponseBody = {
      url: "https://hlogs-bucket.s3.ap-southeast-1.amazonaws.com/SVN12.png"
  };

  // Log the mocked response
  console.log("body after parsed", mockResponseBody);
  console.log("s3 url: ", mockResponseBody.url);

  // Return the mocked URL
  return mockResponseBody.url;
};
*/