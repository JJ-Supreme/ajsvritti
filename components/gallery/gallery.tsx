"use client";

import { useState } from "react";
import NextImage from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const total = images.length;
  const go = (delta: number) => setSelectedIndex((i) => (i + delta + total) % total);

  return (
    <Tab.Group
      as="div"
      className="flex flex-col-reverse"
      selectedIndex={selectedIndex}
      onChange={setSelectedIndex}
    >
      <div className="mx-auto mt-4 w-full max-w-2xl sm:block lg:max-w-2xl">
        <Tab.List className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <GalleryTab image={image} key={index} />
          ))}
        </Tab.List>
      </div>
      <div className="relative">
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
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border border-border p-1.5 shadow-soft-sm hover:bg-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border border-border p-1.5 shadow-soft-sm hover:bg-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}
      </div>
    </Tab.Group>
  );
};

export default Gallery;