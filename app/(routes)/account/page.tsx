"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, MapPin, Package, Plus, ShieldCheck, User as UserIcon } from "lucide-react";
import Container from "@/components/ui/container";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/use-auth-user";
import useCart from "@/hooks/use-cart";
import { AddressForm, type Address } from "./_components/address-form";

export const dynamic = "force-dynamic";

const AccountPage = () => {
  const router = useRouter();
  const { user, isLoading, isSignedIn, refetch } = useAuthUser();
  const removeAllCart = useCart((s) => s.removeAllCart);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [addrError, setAddrError] = useState("");
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isSignedIn) router.replace("/sign-in?redirect_url=/account");
  }, [isLoading, isSignedIn, router]);

  const loadAddresses = useCallback(async () => {
    setLoadingAddr(true);
    setAddrError("");
    try {
      const { data } = await axios.get("/api/addresses");
      setAddresses(data);
    } catch (err: any) {
      setAddrError(err?.response?.data?.error || "Could not load your addresses.");
    } finally {
      setLoadingAddr(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) loadAddresses();
  }, [isSignedIn, loadAddresses]);

  const act = async (id: string, fn: () => Promise<unknown>) => {
    setBusyId(id);
    setAddrError("");
    try {
      await fn();
      await loadAddresses();
    } catch (err: any) {
      setAddrError(err?.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setBusyId(null);
      setConfirmDelete(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    removeAllCart();
    refetch();
    router.refresh();
    router.push("/");
  };

  if (isLoading || !isSignedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const memberSince = (user as any)?.createdAt
    ? new Date((user as any).createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <>
      <Container>
        <div className="py-8 sm:py-12 max-w-3xl mx-auto space-y-8">
          <h1 className="text-2xl sm:text-3xl font-bold">My Account</h1>

          {/* Profile */}
          <section className="bg-white border rounded-xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-accent flex items-center justify-center">
                  <UserIcon className="h-7 w-7 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-lg truncate">{user?.username}</p>
                  <p className="text-sm text-gray-600 break-all">{user?.email}</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Sign out
              </Button>
            </div>
            <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Member since</dt>
                <dd className="font-medium">{memberSince || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Account status</dt>
                <dd className="font-medium inline-flex items-center gap-1 text-green-700">
                  <ShieldCheck size={16} /> Verified
                </dd>
              </div>
            </dl>
            <Link
              href="/my-orders"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Package size={16} /> View my orders
            </Link>
          </section>

          {/* Addresses */}
          <section className="bg-white border rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MapPin size={18} /> Saved addresses
              </h2>
              {editing === null && (
                <Button size="sm" onClick={() => setEditing("new")}>
                  <Plus size={16} className="mr-1" /> Add address
                </Button>
              )}
            </div>

            {addrError && <p className="text-sm text-red-600">{addrError}</p>}

            {editing !== null && (
              <div className="border rounded-lg p-4 bg-surface-1">
                <h3 className="font-medium mb-4">{editing === "new" ? "New address" : "Edit address"}</h3>
                <AddressForm
                  key={editing === "new" ? "new" : editing.id}
                  initial={editing === "new" ? null : editing}
                  onCancel={() => setEditing(null)}
                  onSaved={() => {
                    setEditing(null);
                    loadAddresses();
                  }}
                />
              </div>
            )}

            {loadingAddr ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : addresses.length === 0 && editing === null ? (
              <p className="text-sm text-gray-500 py-4">
                You haven&apos;t saved an address yet. Your delivery address is saved automatically after your first order.
              </p>
            ) : (
              <ul className="space-y-3">
                {addresses.map((a) => (
                  <li
                    key={a.id}
                    className={`border rounded-lg p-4 text-sm ${a.is_default ? "border-primary bg-accent/40" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className="font-semibold flex items-center gap-2">
                          {a.full_name}
                          {a.label && <span className="text-xs font-normal text-gray-500">({a.label})</span>}
                          {a.is_default && (
                            <span className="text-[11px] font-medium bg-primary text-white rounded-full px-2 py-0.5">
                              Default
                            </span>
                          )}
                        </p>
                        <p className="text-gray-600 break-words">
                          {[a.street, a.apartment].filter(Boolean).join(", ")}
                        </p>
                        <p className="text-gray-600">
                          {a.city}, {a.state} – {a.pin_code}
                        </p>
                        <p className="text-gray-600">Phone: {a.phone}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {!a.is_default && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busyId === a.id}
                            onClick={() => act(a.id, () => axios.patch(`/api/addresses/${a.id}`, { is_default: true }))}
                          >
                            Set default
                          </Button>
                        )}
                        <Button size="sm" variant="outline" disabled={busyId === a.id} onClick={() => setEditing(a)}>
                          Edit
                        </Button>
                        {confirmDelete === a.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={busyId === a.id}
                              onClick={() => act(a.id, () => axios.delete(`/api/addresses/${a.id}`))}
                            >
                              {busyId === a.id ? "Deleting…" : "Confirm delete"}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setConfirmDelete(a.id)}>
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </Container>
      <Footer />
    </>
  );
};

export default AccountPage;
