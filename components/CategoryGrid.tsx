"use client";
import Link from "next/link";

type CategoryGridProps = {
  categories: string[];
};

const CategoryGrid = ({ categories }: CategoryGridProps) => {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center gap-8 px-4 md:px-8 py-3 min-w-max">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/shop?topLevelCategory=${encodeURIComponent(category)}`}
              className="text-sm font-medium text-gray-700 hover:text-primary hover:underline transition-colors whitespace-nowrap"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryGrid;
