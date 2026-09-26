import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create an AJS Vritti Vision Marketing account to place and track orders.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
