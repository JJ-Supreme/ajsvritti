"use client";
import { SearchIcon, Loader2, X, ChevronRight, Tag, FolderOpen } from "lucide-react";
import { Input } from "./ui/input";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Product } from "@/types";

interface CategoryResult {
  name: string;
  topLevelCategory: string;
  parentCategory?: string;
}

interface BrowseCategory {
  topLevel: string;
  subcategories: string[];
}

interface SearchResponse {
  categories: CategoryResult[] | BrowseCategory[];
  products: Product[];
  total?: number;
}

const NavbarSearch = () => {
  const [search, setSearch] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryResult[]>([]);
  const [browseCategories, setBrowseCategories] = useState<BrowseCategory[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const pathname = usePathname();

  // Fetch browse categories (shown on focus without query)
  const fetchBrowseCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/search");
      if (res.ok) {
        const data: SearchResponse = await res.json();
        setBrowseCategories(data.categories as BrowseCategory[]);
      }
    } catch {}
  }, []);

  // Search products + categories from API
  const searchProducts = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setProducts([]);
      setCategories([]);
      setTotalResults(0);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=6`
      );
      if (response.ok) {
        const data: SearchResponse = await response.json();
        setProducts(data.products || []);
        setCategories((data.categories as CategoryResult[]) || []);
        setTotalResults(data.total || 0);
        setShowDropdown(true);
        setHighlightIndex(-1);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [browseCategories.length]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, searchProducts]);

  // Load browse categories on mount
  useEffect(() => {
    fetchBrowseCategories();
  }, [fetchBrowseCategories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = () => {
    if (search.length >= 1) {
      setShowDropdown(false);
      router.push(`/shop?q=${encodeURIComponent(search)}`);
    }
  };

  // Total interactive items in dropdown for keyboard nav
  const totalItems = categories.length + products.length + (totalResults > products.length ? 1 : 0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (highlightIndex >= 0 && highlightIndex < categories.length) {
        handleCategoryClick(categories[highlightIndex].name);
      } else if (highlightIndex >= categories.length && highlightIndex < categories.length + products.length) {
        handleProductClick(products[highlightIndex - categories.length].id);
      } else {
        handleSearchSubmit();
      }
    }
    if (e.key === "Escape") {
      setShowDropdown(false);
      setHighlightIndex(-1);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    }
  };

  const handleProductClick = (productId: string) => {
    setShowDropdown(false);
    setSearch("");
    router.push(`/product/${productId}`);
  };

  const handleCategoryClick = (categoryName: string) => {
    setShowDropdown(false);
    setSearch("");
    router.push(`/shop?category=${encodeURIComponent(categoryName)}`);
  };

  const handleTopLevelClick = (topLevel: string) => {
    setShowDropdown(false);
    setSearch("");
    router.push(`/shop?topLevelCategory=${encodeURIComponent(topLevel)}`);
  };

  const clearSearch = () => {
    setSearch("");
    setProducts([]);
    setCategories([]);
    setTotalResults(0);
    setShowDropdown(false);
    setHighlightIndex(-1);
  };

  const handleFocus = () => {
    if (search.trim().length >= 2 && (products.length > 0 || categories.length > 0)) {
      setShowDropdown(true);
    } else if (search.trim().length === 0 && browseCategories.length > 0) {
      setShowDropdown(true);
    }
  };

  useEffect(() => {
    if (pathname !== "/shop") setSearch("");
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentQ = new URLSearchParams(window.location.search).get("q");
    if (currentQ) setSearch(currentQ);
  }, [pathname]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.png";
    const httpsIndex = url.indexOf("https://", 1);
    if (httpsIndex > 0) url = url.substring(httpsIndex);
    return url;
  };

  const isSearchMode = search.trim().length >= 2;
  const isBrowseMode = search.trim().length === 0;

  return (
    <div className="flex mx-auto relative w-full" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative flex w-full border border-border rounded-lg overflow-hidden transition-all duration-200 focus-within:border-primary focus-within:shadow-soft-md">
        <Input
          ref={inputRef}
          className="flex-1 border-none rounded-none bg-surface-1 text-foreground placeholder:text-muted-foreground h-10 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-4"
          placeholder="Search products, categories..."
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          value={search}
          aria-label="Search products and categories"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
        />
        {search && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 hover:bg-surface-2 rounded-full transition-colors z-10"
            aria-label="Clear search"
          >
            <X size={14} className="text-muted-foreground" />
          </button>
        )}
        <button
          onClick={handleSearchSubmit}
          className="bg-primary hover:bg-primary/90 text-white w-11 flex items-center justify-center transition-colors"
          aria-label="Submit search"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <SearchIcon size={16} />
          )}
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white shadow-soft-xl border border-border z-50 rounded-lg overflow-hidden animate-fade-in"
          role="listbox"
        >
          <div className="max-h-[28rem] overflow-y-auto">

            {/* ── Browse Mode (no query) ── */}
            {isBrowseMode && browseCategories.length > 0 && (
              <>
                <div className="px-3 pt-3 pb-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Browse Categories</p>
                </div>
                {(browseCategories as BrowseCategory[]).map((group) => (
                  <div key={group.topLevel}>
                    <button
                      onClick={() => handleTopLevelClick(group.topLevel)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-accent cursor-pointer transition-colors text-left"
                    >
                      <FolderOpen size={14} className="text-primary flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground">{group.topLevel}</span>
                      <ChevronRight size={12} className="text-muted-foreground ml-auto" />
                    </button>
                    <div className="pl-9 pr-3 pb-1">
                      {group.subcategories.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => handleCategoryClick(sub)}
                          className="w-full text-left text-xs text-muted-foreground hover:text-foreground py-1 transition-colors"
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ── Search Mode ── */}
            {isSearchMode && (
              <>
                {/* Matching Categories */}
                {categories.length > 0 && (
                  <>
                    <div className="px-3 pt-3 pb-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Categories</p>
                    </div>
                    {categories.map((cat, idx) => (
                      <button
                        key={cat.name}
                        onClick={() => handleCategoryClick(cat.name)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors text-left ${
                          highlightIndex === idx ? "bg-accent" : "hover:bg-accent"
                        }`}
                      >
                        <Tag size={14} className="text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{cat.name}</p>
                          <p className="text-[10px] text-muted-foreground">{cat.topLevelCategory}</p>
                        </div>
                        <ChevronRight size={12} className="text-muted-foreground" />
                      </button>
                    ))}
                  </>
                )}

                {/* Matching Products */}
                {products.length > 0 && (
                  <>
                    <div className="px-3 pt-3 pb-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Products</p>
                    </div>
                    <div className="divide-y divide-border/50">
                      {products.map((product, idx) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product.id)}
                          className={`w-full flex items-center gap-3 p-3 cursor-pointer transition-colors text-left ${
                            highlightIndex === categories.length + idx ? "bg-accent" : "hover:bg-accent"
                          }`}
                        >
                          <div className="w-10 h-10 relative flex-shrink-0 border border-border bg-surface-1 rounded-md overflow-hidden">
                            <Image
                              src={getImageUrl(product.image)}
                              alt={product.title}
                              fill
                              unoptimized
                              className="object-contain p-0.5"
                              sizes="40px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {product.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                              {product.category}
                            </p>
                          </div>
                          <div className="text-sm font-semibold text-foreground tabular-nums px-2">
                            {formatPrice(product.price)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* No Results */}
                {products.length === 0 && categories.length === 0 && !isLoading && (
                  <div className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No results for &ldquo;{search}&rdquo;
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try a different keyword or browse categories
                    </p>
                  </div>
                )}

                {/* View All Results */}
                {totalResults > products.length && (
                  <button
                    onClick={handleSearchSubmit}
                    className={`w-full p-2.5 text-center text-xs font-semibold text-white bg-foreground hover:bg-foreground/90 cursor-pointer transition-colors ${
                      highlightIndex === categories.length + products.length ? "bg-foreground/90" : ""
                    }`}
                  >
                    View all {totalResults} results
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarSearch;
