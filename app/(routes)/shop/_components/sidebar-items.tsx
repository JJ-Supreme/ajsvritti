"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";

type SidebarItemsProps = {
  categories: string[];
  topLevelCategories: string[];
};

const SidebarItems = ({ categories, topLevelCategories }: SidebarItemsProps) => {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentCategory = searchParams.get("category");
  const currentTopLevel = searchParams.get("topLevelCategory");

  const createQueryString = (name: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    return params.toString();
  };

  const handleFilterClick = (filterType: string, value: string | null) => {
    const queryString = createQueryString(filterType, value);
    router.push(`${pathName}${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Level Category Filter */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Department</p>
        <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto">
          <button
            onClick={() => handleFilterClick('topLevelCategory', null)}
            className={`text-left px-2.5 py-1.5 rounded-md text-sm transition-colors ${
              !currentTopLevel ? "font-medium text-primary bg-accent" : "text-foreground hover:bg-surface-1"
            }`}
          >
            All
          </button>
          {topLevelCategories.slice(0, 15).map((topLevel) => (
            <button
              key={topLevel}
              onClick={() => handleFilterClick('topLevelCategory', topLevel)}
              className={`text-left px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                currentTopLevel === topLevel ? "font-medium text-primary bg-accent" : "text-foreground hover:bg-surface-1"
              }`}
            >
              {topLevel}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Category</p>
        <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto">
          <button
            onClick={() => handleFilterClick('category', null)}
            className={`text-left px-2.5 py-1.5 rounded-md text-sm transition-colors ${
              !currentCategory ? "font-medium text-primary bg-accent" : "text-foreground hover:bg-surface-1"
            }`}
          >
            All
          </button>
          {categories.slice(0, 20).map((category) => (
            <button
              key={category}
              onClick={() => handleFilterClick('category', category)}
              className={`text-left px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                currentCategory === category ? "font-medium text-primary bg-accent" : "text-foreground hover:bg-surface-1"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidebarItems;
