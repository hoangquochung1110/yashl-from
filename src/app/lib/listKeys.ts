"use server";
import aws4 from "aws4";
import https from "https";

interface ListKeysResponse {
  statusCode: number | undefined;
  body: string;
}

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
};


export default async function listKeys(uid: string) {
  const service = 'execute-api';
  const host = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;
  const canonicalURI = `/key?user_id=${uid}`;
  const region = 'ap-southeast-1';

  const options = {
    hostname: host,
    path: canonicalURI,
    method: 'GET',
    headers: {
      'Host': host,
    },
  };
  try{
    const { accessKeyId, secretAccessKey } = credentials ?? {};
    const signer = aws4.sign({
      service: service,
      region: region,
      path: canonicalURI,
      headers: options.headers,
      method: options.method,
      body: '',
    }, {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    });
    
    Object.assign(options.headers, signer.headers);
    return new Promise<ListKeysResponse>((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            body: body,
          });
        });
      });
  
      req.on('error', (e) => {
        reject(e);
      });
  
      req.end();
    });
  } catch{
    throw new Error('Fail to send request');
  }
}
