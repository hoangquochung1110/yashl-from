'use server'
import aws4 from "aws4";
import https from "https";
import assumeRole from "@/app/lib/assumeRole";

const host = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;
const canonicalURI = '/key';
const service = 'execute-api';
const region = process.env.AWS_REGION;

export default async function shortenUrl(formData: FormData): Promise<{ key: string; shortUrl: string }> {
  // Combine the key with custom domain to form the full shortened URL
  // For example: https://<custom_domain>/<key>.html
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
      body: JSON.stringify({ destination_url: url, user_id: uid }),
    }, {
      accessKeyId: AccessKeyId,
      secretAccessKey: SecretAccessKey,
      sessionToken: SessionToken,
    });
    
    Object.assign(options.headers, signer.headers);
    return new Promise<{ key: string, shortUrl: string }>((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const result = JSON.parse(body);
            const key = result.key;
            // TODO: in case no NEXT_PUBLIC_CLIENT_DOMAIN, need a default domain
            const shortUrl = `${process.env.NEXT_PUBLIC_CLIENT_DOMAIN}/${key}.html`;
            resolve({key, shortUrl}); // Return shortUrl directly
          } catch (error) {
            reject(error);
          }
        });
      });
  
      req.on('error', (e) => {
        reject(e);
      });
  
      req.write(JSON.stringify({ destination_url: url, user_id: uid }));
      req.end();
    });
  } catch {
    throw new Error('Failed to assume role or send request');
  }
}
