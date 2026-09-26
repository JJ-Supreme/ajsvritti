"use client";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeftRight, ClipboardList, LayoutDashboard, Package, Settings, Users } from "lucide-react";

const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin", exact: true },
  { label: "Orders", icon: ClipboardList, href: "/admin/orders" },
  { label: "Products", icon: Package, href: "/admin/products", exact: true },
  { label: "Import/Export", icon: ArrowLeftRight, href: "/admin/products/import-export" },
  { label: "Customers", icon: Users, href: "/admin/customers" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

const NavItem = () => {
  const router = useRouter();
  const pathname = usePathname();

  const active = (route: (typeof routes)[number]) =>
    route.exact
      ? pathname === route.href || (route.href === "/admin/products" && /^\/admin\/products\/(new|\d+)/.test(pathname))
      : pathname.startsWith(route.href);

  return (
    <div className="flex flex-col flex-start">
      {routes.map((route) => (
        <Button
          onClick={() => router.push(route.href)}
          key={route.href}
          size="sm"
          variant="ghost"
          className={`w-full text-white font-normal justify-start hover:bg-white/10 hover:text-white ${
            active(route) ? "bg-white/20 text-white font-bold" : ""
          }`}
        >
          <route.icon className="h-4 w-4 mr-2" />
          {route.label}
        </Button>
      ))}
    </div>
  );
};

export default NavItem;
