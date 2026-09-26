import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID } from "@/config/client";

// Columns verified against the live schema (addresses): id, user_id, label, full_name,
// phone, street, apartment, city, state, pin_code, country, is_default, created_at, client_id.
export const addressSchema = z.object({
  label: z.string().trim().max(30).optional().default("Home"),
  full_name: z.string().trim().min(2, "Enter the recipient's full name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  street: z.string().trim().min(5, "Enter the full street address").max(200),
  apartment: z.string().trim().max(100).optional().nullable(),
  city: z.string().trim().min(2, "City is required").max(80),
  state: z.string().trim().min(2, "State is required").max(80),
  pin_code: z.string().trim().regex(/^\d{6}$/, "PIN code must be exactly 6 digits"),
  is_default: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;

const COLUMNS = "id,label,full_name,phone,street,apartment,city,state,pin_code,country,is_default,created_at";

function fail(error: { message: string } | null, what: string): never {
  throw new Error(`${what}: ${error?.message || "unknown error"}`);
}

export async function listAddresses(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("addresses")
    .select(COLUMNS)
    .eq("user_id", userId)
    .eq("client_id", CLIENT_ID)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) fail(error, "Could not load addresses");
  return data || [];
}

async function clearDefault(userId: string, exceptId?: string) {
  const supabase = createAdminClient();
  let q = supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", userId)
    .eq("client_id", CLIENT_ID)
    .eq("is_default", true);
  if (exceptId) q = q.neq("id", exceptId);
  const { error } = await q;
  if (error) fail(error, "Could not update default address");
}

export async function createAddress(userId: string, input: AddressInput) {
  const supabase = createAdminClient();
  const existing = await listAddresses(userId);
  const makeDefault = input.is_default === true || existing.length === 0;
  if (makeDefault) await clearDefault(userId);
  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: userId,
      client_id: CLIENT_ID,
      label: input.label || "Home",
      full_name: input.full_name,
      phone: input.phone,
      street: input.street,
      apartment: input.apartment || null,
      city: input.city,
      state: input.state,
      pin_code: input.pin_code,
      country: "India",
      is_default: makeDefault,
    })
    .select(COLUMNS)
    .single();
  if (error || !data) fail(error, "Could not save address");
  return data;
}

export async function updateAddress(userId: string, id: string, input: AddressInput) {
  const supabase = createAdminClient();
  if (input.is_default) await clearDefault(userId, id);
  const patch: Record<string, unknown> = {
    label: input.label || "Home",
    full_name: input.full_name,
    phone: input.phone,
    street: input.street,
    apartment: input.apartment || null,
    city: input.city,
    state: input.state,
    pin_code: input.pin_code,
  };
  if (input.is_default !== undefined) patch.is_default = input.is_default;
  const { data, error } = await supabase
    .from("addresses")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .eq("client_id", CLIENT_ID)
    .select(COLUMNS);
  if (error) fail(error, "Could not update address");
  if (!data || data.length === 0) return null;
  return data[0];
}

export async function setDefaultAddress(userId: string, id: string) {
  const supabase = createAdminClient();
  await clearDefault(userId, id);
  const { data, error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", userId)
    .eq("client_id", CLIENT_ID)
    .select(COLUMNS);
  if (error) fail(error, "Could not set default address");
  if (!data || data.length === 0) return null;
  return data[0];
}

export async function deleteAddress(userId: string, id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .eq("client_id", CLIENT_ID)
    .select("id,is_default");
  if (error) fail(error, "Could not delete address");
  if (!data || data.length === 0) return false;
  if (data[0].is_default) {
    const rest = await listAddresses(userId);
    if (rest.length) await setDefaultAddress(userId, rest[0].id);
  }
  return true;
}

const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * After a successful order: make the address the user just shipped to their default
 * without inserting a new row per order. Same content (name + PIN + street) -> just
 * promote it; otherwise update the existing default; otherwise create the first one.
 */
export async function upsertDefaultFromOrder(userId: string, a: AddressInput) {
  const existing = await listAddresses(userId);
  const same = existing.find(
    (e) =>
      norm(e.full_name) === norm(a.full_name) &&
      e.pin_code === a.pin_code &&
      norm(e.street) === norm(a.street)
  );
  if (same) {
    if (!same.is_default) await setDefaultAddress(userId, same.id);
    return same.id;
  }
  const current = existing.find((e) => e.is_default);
  if (current) {
    await updateAddress(userId, current.id, { ...a, label: current.label || "Home", is_default: true });
    return current.id;
  }
  const created = await createAddress(userId, { ...a, is_default: true });
  return created.id;
}
