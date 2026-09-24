"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const NavItem = () => {
  const pathname = usePathname();
  
  // Temporarily disable admin check
  const isAdmin = false;

  const routes = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Shop",
      href: "/shop",
    },
    {
      label: "Featured",
      href: "/featured",
    },
    {
      label: "About Us",
      href: "/about-us",
    },
    // Temporarily hide admin route
    // {
    //   label: "Admin",
    //   href: "/admin",
    // },
  ];

  return (
    <div className="flex items-center gap-2 mx-2 max-md:flex-col max-md:items-start max-md:mt-3">
      {routes.map((route) => {
        if (route.label === "Admin" && !isAdmin) {
          return null;
        }
        return (
          <Link key={route.label} href={route.href} className="p-2 max-md:p-0">
            <p
              className={`font-medium text-white hover:text-white/80 transition-colors ${
                (pathname === route.href ||
                  pathname.startsWith(`${route.href}/`)) &&
                "font-bold underline decoration-yellow-400 underline-offset-4"
              }`}
            >
              {route.label}
            </p>
          </Link>
        );
      })}
    </div>
  );
};

export default NavItem;
