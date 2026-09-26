import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Products you have saved at AJS Vritti Vision Marketing.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
