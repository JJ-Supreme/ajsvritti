import NextImage from "next/image";
import { Tab } from "@headlessui/react";

import { cn } from "@/lib/utils";

interface GalleryTabProps {
  image: string;
}

// Upgrade Meesho image URL to higher resolution
const upgradeImageResolution = (url: string): string => {
  if (!url) return '';

  // Handle malformed URLs (concatenated URLs like "https://...https://...")
  const httpsIndex = url.indexOf('https://', 1);
  const httpIndex = url.indexOf('http://', 1);

  if (httpsIndex > 0) {
    url = url.substring(httpsIndex);
  } else if (httpIndex > 0) {
    url = url.substring(httpIndex);
  }

  // If not a proper URL, add base URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    const baseUrl = "https://kemal-web-storage.s3.eu-north-1.amazonaws.com";
    return `${baseUrl}${url}`;
  }

  // For Meesho images: upgrade _512 to _1200 and remove width query param
  if (url.includes('images.meesho.com')) {
    url = url.replace(/\?width=\d+/, '');
    url = url.replace(/_512\./, '_1200.');
  }

  return url;
};

const GalleryTab: React.FC<GalleryTabProps> = ({ image }) => {
  return (
    <Tab className="relative flex aspect-square cursor-pointer items-center justify-center rounded-md bg-white">
      {({ selected }) => (
        <div>
          <span className="absolute h-full w-full aspect-square inset-0 overflow-hidden rounded-md">
            <NextImage
              fill
              src={upgradeImageResolution(image)}
              alt=""
              className="object-cover object-center"
              quality={80}
              sizes="100px"
            />
          </span>
          <span
            className={cn(
              "absolute inset-0 rounded-md ring-2 ring-offset-2",
              selected ? "ring-primary" : "ring-transparent"
            )}
          />
        </div>
      )}
    </Tab>
  );
};

export default GalleryTab;
