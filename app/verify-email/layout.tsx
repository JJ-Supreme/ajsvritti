import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address to activate your AJS Vritti Vision Marketing account.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
