import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link href="/">
      <div className="hover:opacity-75 transition flex items-center gap-2">
        <span className="text-xl font-bold text-white">
          AJS VISION
        </span>
      </div>
    </Link>
  );
};

export default Logo;
