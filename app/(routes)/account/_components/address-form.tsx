"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type Address = {
  id: string;
  label: string | null;
  full_name: string;
  phone: string;
  street: string;
  apartment: string | null;
  city: string;
  state: string;
  pin_code: string;
  is_default: boolean;
};

type Props = {
  initial?: Address | null;
  onSaved: (address: Address) => void;
  onCancel: () => void;
};

const readOnlyClass = "bg-gray-100 text-gray-600 cursor-not-allowed";

export function AddressForm({ initial, onSaved, onCancel }: Props) {
  const [label, setLabel] = useState(initial?.label || "Home");
  const [fullName, setFullName] = useState(initial?.full_name || "");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [street, setStreet] = useState(initial?.street || "");
  const [apartment, setApartment] = useState(initial?.apartment || "");
  const [pin, setPin] = useState(initial?.pin_code || "");
  const [city, setCity] = useState(initial?.city || "");
  const [stateName, setStateName] = useState(initial?.state || "");
  const [isDefault, setIsDefault] = useState(initial?.is_default || false);

  const [locked, setLocked] = useState(false);
  const [lookup, setLookup] = useState<"idle" | "loading" | "failed">("idle");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const latestPin = useRef(pin);

  const runLookup = async (value: string) => {
    latestPin.current = value;
    setLookup("loading");
    try {
      const res = await fetch(`/api/pincode/${value}`, { signal: AbortSignal.timeout(8000) });
      const data = await res.json();
      if (latestPin.current !== value) return; // a newer PIN superseded this lookup
      const po = data?.postOffices?.[0];
      if (res.ok && data.status === "success" && po) {
        setCity(po.District);
        setStateName(po.State);
        setLocked(true);
        setLookup("idle");
      } else {
        setLocked(false);
        setLookup("failed");
      }
    } catch {
      if (latestPin.current !== value) return;
      setLocked(false);
      setLookup("failed");
    }
  };

  // Editing an existing address: re-verify its PIN so city/state are locked like a fresh entry.
  useEffect(() => {
    if (/^\d{6}$/.test(pin)) runLookup(pin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPinChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 6);
    setPin(digits);
    if (digits.length === 6) {
      if (locked) {
        setCity("");
        setStateName("");
      }
      runLookup(digits);
    } else {
      latestPin.current = digits;
      if (locked) {
        setCity("");
        setStateName("");
      }
      setLocked(false);
      setLookup("idle");
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      label,
      full_name: fullName,
      phone,
      street,
      apartment: apartment || null,
      city,
      state: stateName,
      pin_code: pin,
      is_default: isDefault,
    };
    try {
      const { data } = initial
        ? await axios.put(`/api/addresses/${initial.id}`, payload)
        : await axios.post("/api/addresses", payload);
      onSaved(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Could not save the address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const field = "space-y-1";
  const labelClass = "text-sm font-medium";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={field}>
          <label className={labelClass} htmlFor="addr-label">Label</label>
          <Input id="addr-label" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={30} placeholder="Home, Office…" />
        </div>
        <div className={field}>
          <label className={labelClass} htmlFor="addr-name">Full name *</label>
          <Input id="addr-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className={field}>
          <label className={labelClass} htmlFor="addr-phone">Phone number *</label>
          <Input
            id="addr-phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit phone number"
            required
          />
        </div>
        <div className={field}>
          <label className={labelClass} htmlFor="addr-pin">PIN code *</label>
          <div className="relative">
            <Input
              id="addr-pin"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => onPinChange(e.target.value)}
              placeholder="6-digit PIN code"
              required
            />
            {lookup === "loading" && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-500" />
            )}
          </div>
          {lookup === "failed" && (
            <p className="text-xs text-amber-700">Couldn&apos;t auto-detect this PIN — enter manually.</p>
          )}
        </div>
      </div>

      <div className={field}>
        <label className={labelClass} htmlFor="addr-street">Street address *</label>
        <Input id="addr-street" value={street} onChange={(e) => setStreet(e.target.value)} required />
      </div>
      <div className={field}>
        <label className={labelClass} htmlFor="addr-apt">Apartment, suite, landmark (optional)</label>
        <Input id="addr-apt" value={apartment} onChange={(e) => setApartment(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={field}>
          <label className={labelClass} htmlFor="addr-city">City *</label>
          <Input
            id="addr-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            readOnly={locked}
            className={locked ? readOnlyClass : ""}
            required
          />
        </div>
        <div className={field}>
          <label className={labelClass} htmlFor="addr-state">State *</label>
          <Input
            id="addr-state"
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
            readOnly={locked}
            className={locked ? readOnlyClass : ""}
            required
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
        Use as my default delivery address
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || lookup === "loading"}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : initial ? (
            "Save changes"
          ) : (
            "Add address"
          )}
        </Button>
      </div>
    </form>
  );
}
