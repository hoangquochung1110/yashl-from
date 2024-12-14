import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";

// Set the AWS Region.
const REGION = process.env.NEXT_AWS_REGION;
const ROLE_ARN = process.env.NEXT_AWS_ROLE_ARN;

// Create an AWS STS service client object.
export const client = new STSClient({ region: REGION });

export default async function assumeRole() {
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
      const response = await client.send(command);
      return response;
    } catch (err) {
      return err;
    }
};
