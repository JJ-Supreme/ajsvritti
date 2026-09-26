import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your profile and saved addresses.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
