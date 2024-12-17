import fetch from "node-fetch";

interface ScreenshotApiResponse {
  message: string;
  data: {
    url: string;
    message: string;
  };
}

export default async function takeScreenshot(key: string, url: string) {
    const payload = {
      "key": key,
      "destinationUrl": url,
    };
    try{
      console.log("Taking screenshots...");
      const response = await fetch(`${process.env.NEXT_PUBLIC_KEY_SCREENSHOT_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        throw new Error('Failed to take screenshot');
      }
      const body = await response.json();
      // return "https://hlogs-bucket.s3.ap-southeast-1.amazonaws.com/omSrua.png"
      console.log("body after parsed", body);
      console.log("s3 url: ", body.url);
      return body.url;
    }
    catch (error) {
      throw error;
    }
}
