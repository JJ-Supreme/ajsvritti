"use client";

import Logo from "@/components/Logo";
import Link from "next/link";
import CreateButton from "./create-button";
import MobileSidebar from "./mobile-sidebar";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Navbar = ({ email }: { email?: string }) => {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="z-50 fixed bg-neutral-800 w-full h-14 flex items-center justify-between px-3 sm:px-4 border-b border-b-gray-600">
      <div className="flex items-center gap-x-2 min-w-0">
        <Logo />
        <MobileSidebar>
          <Sidebar />
        </MobileSidebar>
        <p className="text-white hidden sm:block text-sm">ADMIN PANEL</p>
      </div>
      <div className="flex items-center gap-x-2 sm:gap-x-4 shrink-0">
        <CreateButton />
        <Link href="/" className="text-xs text-gray-300 hover:text-white hidden sm:inline">
          View store
        </Link>
        <span className="text-xs text-gray-300 hidden md:inline truncate max-w-[150px]">{email}</span>
        <Button size="sm" variant="secondary" onClick={logout}>
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
