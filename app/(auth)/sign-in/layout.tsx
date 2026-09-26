import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your AJS Vritti Vision Marketing account.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
