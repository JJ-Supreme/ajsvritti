'use client';

import Container from './ui/container';
import NavbarActions from './navbar-actions';
import { useAuthUser } from '@/hooks/use-auth-user';
import { Button } from './ui/button';
import NavbarSearch from './navbar-search';
import Link from 'next/link';
import { Menu, X, Home, ShoppingBag, Info, Phone } from 'lucide-react';
import { useRouter, usePathname } from "next/navigation";
import useCart from "@/hooks/use-cart";
import { useState, useEffect } from 'react';

const NavBar = () => {
  const { isSignedIn, user, refetch } = useAuthUser();
  const router = useRouter();
  const pathname = usePathname();
  const cart = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    cart.removeAllCart();
    refetch();
    router.refresh();
    router.push("/");
  };

  return (
    <div className="flex flex-col w-full z-50">
      {/* MAIN HEADER */}
      <div className="bg-white border-b border-border shadow-soft-sm sticky top-0 z-40">
        <Container>
          <div className="py-3 flex items-center gap-6 justify-between">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="block md:hidden p-1.5 -ml-1.5 text-foreground"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link href="/">
                <div className="flex flex-col leading-none">
                  <span className="text-xl font-black text-foreground tracking-tight">
                    AJS <span className="text-primary">VRITTI</span>
                  </span>
                  <span className="text-[9px] font-medium text-muted-foreground tracking-[0.2em] -mt-0.5">
                    VISION MARKETING PVT LTD
                  </span>
                </div>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden md:block flex-1 max-w-xl mx-auto">
              <NavbarSearch />
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-2">
              <NavbarActions />
              <div className="h-5 w-px bg-border hidden sm:block" />
              {isSignedIn ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:inline truncate max-w-[120px]">
                    {user?.username || user?.email}
                  </span>
                  <Button
                    variant="ghost"
                    className="text-sm font-medium text-foreground hidden sm:inline-flex"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1">
                  <Link href="/sign-in">
                    <Button
                      variant="ghost"
                      className="text-sm font-medium text-foreground"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button
                      variant="ghost"
                      className="text-sm font-medium text-foreground"
                    >
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <NavbarSearch />
          </div>
        </Container>
      </div>

      {/* Navigation Bar - Desktop */}
      <div className="bg-foreground text-white hidden md:block">
        <Container>
          <div className="flex items-center h-11 gap-1 text-sm font-medium">
            {[
              { href: "/", label: "HOME" },
              { href: "/shop", label: "PRODUCTS" },
              { href: "/about-us", label: "ABOUT US" },
              { href: "/contact-us", label: "CONTACT US" },
            ].map(({ href, label }) => {
              const isActive =
                href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 h-full inline-flex items-center transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
                  )}
                </Link>
              );
            })}
          </div>
        </Container>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80vw] bg-foreground text-white shadow-xl animate-slide-in-left flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex flex-col leading-none">
                <span className="text-lg font-black tracking-tight">
                  AJS <span className="text-primary">VRITTI</span>
                </span>
                <span className="text-[8px] font-medium text-white/50 tracking-[0.2em]">
                  VISION MARKETING PVT LTD
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-white/70 hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 overflow-y-auto">
              <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-white/10 transition-colors">
                <Home size={18} /> Home
              </Link>
              <Link href="/shop" className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-white/10 transition-colors">
                <ShoppingBag size={18} /> Products
              </Link>
              <Link href="/about-us" className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-white/10 transition-colors">
                <Info size={18} /> About Us
              </Link>
              <Link href="/contact-us" className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-white/10 transition-colors">
                <Phone size={18} /> Contact Us
              </Link>
            </nav>
            <div className="p-4 border-t border-white/10">
              {isSignedIn ? (
                <div className="space-y-2">
                  <p className="text-xs text-white/50 truncate">{user?.username || user?.email}</p>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="w-full text-left text-sm font-medium text-white/70 hover:text-white py-2 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/sign-in" className="flex-1 text-center text-sm font-medium bg-white/10 hover:bg-white/20 py-2.5 rounded-lg transition-colors">
                    Login
                  </Link>
                  <Link href="/sign-up" className="flex-1 text-center text-sm font-medium bg-primary hover:bg-primary/90 py-2.5 rounded-lg transition-colors">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
