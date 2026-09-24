"use client";

import NextImage from "next/image";
import { Tab } from "@headlessui/react";
import GalleryTab from "./gallery-tab";

interface GalleryProps {
  images: string[];
}

const upgradeImageResolution = (url: string): string => {
  if (!url) return '';
  const httpsIndex = url.indexOf('https://', 1);
  const httpIndex = url.indexOf('http://', 1);

  if (httpsIndex > 0) url = url.substring(httpsIndex);
  else if (httpIndex > 0) url = url.substring(httpIndex);

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    const baseUrl = "https://kemal-web-storage.s3.eu-north-1.amazonaws.com";
    return `${baseUrl}${url}`;
  }

  if (url.includes('images.meesho.com')) {
    url = url.replace(/\?width=\d+/, '');
    url = url.replace(/_512\./, '_1200.');
  }

  return url;
};

const Gallery: React.FC<GalleryProps> = ({ images = [] }) => {
  return (
    <Tab.Group as="div" className="flex flex-col-reverse">
      <div className="mx-auto mt-4 w-full max-w-2xl sm:block lg:max-w-2xl">
        <Tab.List className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <GalleryTab image={image} key={index} />
          ))}
        </Tab.List>
      </div>
      <Tab.Panels className="aspect-square w-full bg-white border border-border rounded-lg p-4">
        {images.map((image, index) => (
          <Tab.Panel key={index}>
            <div className="aspect-square relative h-full w-full overflow-hidden">
              <NextImage
                fill
                src={upgradeImageResolution(image)}
                alt="Product Image"
                className="object-contain object-center opacity-0 duration-300 transition-opacity"
                quality={90}
                priority={index === 0}
                onLoad={(event) => event.currentTarget.classList.remove("opacity-0")}
              />
            </div>
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};

export default Gallery;