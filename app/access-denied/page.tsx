import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <ShieldAlert size={64} className="text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Access Denied
        </h1>
        <p className="text-gray-600 mb-6">
          You don&apos;t have permission to access the admin panel. This area is
          restricted to authorized administrators only.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          If you believe you should have access, please contact your system
          administrator.
        </p>
        <div className="space-y-3">
          <Link href="/">
            <Button className="w-full">
              Go to Homepage
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
