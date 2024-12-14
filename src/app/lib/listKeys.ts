"use server";
import aws4 from "aws4";
import https from "https";
import assumeRole from "@/app/lib/assumeRole";

interface ListKeysResponse {
  statusCode: number | undefined;
  body: string;
}


export default async function listKeys(uid: string) {
  const service = 'execute-api';
  const host = 'api.ssan.me';
  const canonicalURI = `/list_key?user_id=${uid}`;
  const region = 'ap-southeast-1';

  const options = {
    hostname: host,
    path: canonicalURI,
    method: 'GET',
    headers: {
      'Host': host,
    },
  };

  const assumeRoleResponse = await assumeRole();
  const accessKey = assumeRoleResponse.Credentials.AccessKeyId;
  const secretKey = assumeRoleResponse.Credentials.SecretAccessKey;
  const sessionToken =  assumeRoleResponse.Credentials.SessionToken;

  const signer = aws4.sign({
      service: service,
      region: region,
      path: canonicalURI,
      headers: options.headers,
      method: options.method,
      body: '',
    }, {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      sessionToken: sessionToken,
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
}
