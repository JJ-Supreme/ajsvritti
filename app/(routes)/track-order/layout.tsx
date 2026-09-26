import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Track the status of your order.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
