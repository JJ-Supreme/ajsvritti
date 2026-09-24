"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import AutoplayPlugin from "embla-carousel-autoplay";
import Image from "next/image";

const ImageCarousel = () => {
  const images = [
    {
      src: "/carouselFeatured/OfferOne.jpg",
      alt: "Offer One"
    },
    {
      src: "/carouselFeatured/OfferTwo.jpg", 
      alt: "Offer Two"
    },
    {
      src: "/carouselFeatured/OfferThree.jpg",
      alt: "Offer Three"
    }
  ];

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[
        AutoplayPlugin({
          delay: 3000,
        }),
      ]}
      className="w-full relative"
    >
      <CarouselPrevious className="absolute z-50 left-7 w-min h-min text-xl p-4 top-[45%]" />
      <CarouselNext className="absolute z-50 w-min h-min right-4 text-xl top-[45%] p-4" />
      <CarouselContent className="-ml-1">
        {images.map((image, index) => (
          <CarouselItem
            key={index}
            className="basis-full"
          >
            <div className="relative w-full max-w-7xl mx-auto h-80 sm:h-96 lg:h-[500px] overflow-hidden rounded-lg">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 95vw, (max-width: 1024px) 90vw, 85vw"
                priority={index === 0}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export default ImageCarousel;
