import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View your AJS Vritti Vision Marketing orders.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
