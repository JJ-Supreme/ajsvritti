"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
}

export default function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (showEllipsisStart) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      if (showEllipsisEnd) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="flex items-center justify-center gap-1 mt-8"
      aria-label="Pagination"
    >
      {/* Previous button */}
      <Link
        href={createPageURL(currentPage - 1)}
        className={cn(
          "flex items-center justify-center h-10 px-3 rounded-md text-sm font-medium transition-all duration-200",
          currentPage === 1
            ? "pointer-events-none opacity-50 text-muted-foreground"
            : "text-foreground hover:bg-surface-1 border border-transparent hover:border-border"
        )}
        aria-disabled={currentPage === 1}
        tabIndex={currentPage === 1 ? -1 : 0}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Link>

      {/* Page numbers */}
      <div className="hidden sm:flex items-center gap-1">
        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="flex items-center justify-center h-10 w-10 text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={createPageURL(page as number)}
              className={cn(
                "flex items-center justify-center h-10 w-10 rounded-md text-sm font-medium transition-all duration-200",
                currentPage === page
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-surface-1 border border-transparent hover:border-border"
              )}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </Link>
          )
        )}
      </div>

      {/* Mobile page indicator */}
      <span className="sm:hidden flex items-center justify-center px-4 text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next button */}
      <Link
        href={createPageURL(currentPage + 1)}
        className={cn(
          "flex items-center justify-center h-10 px-3 rounded-md text-sm font-medium transition-all duration-200",
          currentPage === totalPages
            ? "pointer-events-none opacity-50 text-muted-foreground"
            : "text-foreground hover:bg-surface-1 border border-transparent hover:border-border"
        )}
        aria-disabled={currentPage === totalPages}
        tabIndex={currentPage === totalPages ? -1 : 0}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Link>
    </nav>
  );
}
