import React from 'react';
import Image from 'next/image';


interface ScreenshotPreviewProps {
  imageUrl: string; // Expecting a string for the image URL
}

// Define the MyComponent with props
const ScreenshotPreview: React.FC<ScreenshotPreviewProps> = ({ imageUrl }) => {
  // Validate the image URL format (optional)
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div>
      {isValidUrl(imageUrl) ? (
        <Image
          src={imageUrl}
          alt="Description of image"
          width={500}
          height={300}
          unoptimized // Optional: use this if you want to bypass Next.js image optimization
        />
      ) : (
        <p>Error: Invalid image URL</p>
      )}
    </div>
  );
};

export default ScreenshotPreview;
