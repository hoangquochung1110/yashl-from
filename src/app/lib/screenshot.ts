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
      const response = await fetch(`${process.env.NEXT_PUBLIC_SCREENSHOT_API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      const screenshotData: ScreenshotApiResponse = await response.json();
      return screenshotData.data.url;
    }
    catch (error) {
      throw error;
    }
}
