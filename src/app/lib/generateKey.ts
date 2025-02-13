'use server'
import aws4 from "aws4";
import https from "https";

const host = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;
const canonicalURI = '/key';
const service = 'execute-api';
const region = process.env.AWS_REGION;

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
};

export default async function shortenUrl(formData: FormData): Promise<{ shortPath: string; shortUrl: string }> {
  // Combine the key with custom domain to form the full shortened URL
  // For example: https://<custom_domain>/<key>
  const url = formData.get('url') as string;
  const uid = formData.get('uid') as string;
  if (!url) {
    throw Error("URL is required");
  }
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
    const { accessKeyId, secretAccessKey } = credentials ?? {};
    const signer = aws4.sign({
      service: service,
      region: region,
      path: canonicalURI,
      headers: options.headers,
      method: options.method,
      body: JSON.stringify({ target_url: url, user_id: uid }),
    }, {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    });
    
    Object.assign(options.headers, signer.headers);
    return new Promise<{ shortPath: string, shortUrl: string }>((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const result = JSON.parse(body);
            const shortPath = result.short_path;
            const shortUrl = `${process.env.NEXT_PUBLIC_CLIENT_DOMAIN}/${shortPath}`;
            resolve({shortPath: shortPath, shortUrl: shortUrl}); // Return shortUrl directly
          } catch (error) {
            reject(error);
          }
        });
      });
  
      req.on('error', (e) => {
        reject(e);
      });
  
      req.write(JSON.stringify({ target_url: url, user_id: uid }));
      req.end();
    });
  } catch {
    throw new Error('Failed to send request');
  }
}
