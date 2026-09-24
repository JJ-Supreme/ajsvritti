"use client";

import Link from "next/link";

const Billboard = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 rounded-xl overflow-hidden">
      <Link href="/shop">
        <div
          style={{
            backgroundImage: `url('/banner.png')`,
          }}
          className="rounded-xl relative aspect-[2/1] md:aspect-[4/1] overflow-hidden bg-cover bg-center group cursor-pointer hover:opacity-95 transition-opacity duration-300"
        >
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>
      </Link>
    </div>
  );
};

export default Billboard;
