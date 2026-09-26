import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your AJS Vritti Vision Marketing order has been placed.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
