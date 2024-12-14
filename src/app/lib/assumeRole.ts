import { STSClient, AssumeRoleCommand, AssumeRoleCommandOutput } from "@aws-sdk/client-sts";

// Set the AWS Region.
const REGION = process.env.NEXT_AWS_REGION;
const ROLE_ARN = process.env.NEXT_AWS_ROLE_ARN;

const credentials = {
  accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY,
};

// Create an AWS STS service client object.
export const client = new STSClient({
  region: REGION,
  credentials: credentials,
});


export default async function assumeRole(): Promise<AssumeRoleCommandOutput> {
  try {
      // Returns a set of temporary security credentials that you can use to
      // access Amazon Web Services resources that you might not normally
      // have access to.
      const command = new AssumeRoleCommand({
        // The Amazon Resource Name (ARN) of the role to assume.
        RoleArn: ROLE_ARN,
        // An identifier for the assumed role session.
        RoleSessionName: "session1",
        // The duration, in seconds, of the role session. The value specified
        // can range from 900 seconds (15 minutes) up to the maximum session
        // duration set for the role.
        DurationSeconds: 900,
      });
      const response: AssumeRoleCommandOutput = await client.send(command);
      return response;
    } catch (err) {
      throw err;
    }
};
