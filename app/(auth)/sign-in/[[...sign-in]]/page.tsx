"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthUser } from "@/hooks/use-auth-user";

export default function Page() {
  const router = useRouter();
  const { isSignedIn, isLoading: authLoading } = useAuthUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectUrl = useMemo(() => {
    if (typeof window === "undefined") return "/";
    return new URLSearchParams(window.location.search).get("redirect_url") || "/";
  }, []);

  // Already signed in: skip the form and go where the user was heading.
  useEffect(() => {
    if (!authLoading && isSignedIn) {
      if (redirectUrl.startsWith("http")) window.location.replace(redirectUrl);
      else router.replace(redirectUrl);
    }
  }, [authLoading, isSignedIn, redirectUrl, router]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.requiresVerification) {
          router.push(`/verify-email?email=${encodeURIComponent(data.email ?? email)}`);
          return;
        }
        setError(data.error || "Failed to sign in");
        return;
      }

      if (redirectUrl.startsWith("http")) {
        window.location.href = redirectUrl;
      } else {
        router.push(redirectUrl);
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || isSignedIn) return null;

  return (
    <div className="flex justify-center items-center min-h-[90vh] p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white border rounded-xl p-6 shadow-sm"
      >
        <h1 className="text-2xl font-bold mb-1">Sign In</h1>
        <p className="text-sm text-gray-500 mb-6">Access your account</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error ? <p className="text-sm text-red-600 mt-4">{error}</p> : null}

        <Button type="submit" className="w-full mt-6" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        <p className="text-sm text-gray-600 mt-4">
          No account?{" "}
          <Link className="text-primary font-semibold" href="/sign-up">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
