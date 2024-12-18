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

export async function takeScreenshot(key: string, url: string): Promise<TakeScreenshotResponse> {
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
      body: JSON.stringify({ destinationUrl: url, key: key }),
    }, {
      accessKeyId: AccessKeyId,
      secretAccessKey: SecretAccessKey,
      sessionToken: SessionToken,
    });
    
    Object.assign(options.headers, signer.headers);
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const result: ScreenshotApiResponse = JSON.parse(body);
            const s3ObjectUrl = result.data.url;
            resolve(s3ObjectUrl);
          } catch (error) {
            reject(error);
          }
        });
      });
  
      req.on('error', (e) => {
        reject(e);
      });
  
      req.write(JSON.stringify({ destinationUrl: url, key: key }));
      req.end();
    });
  } catch(err) {
    throw err;
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