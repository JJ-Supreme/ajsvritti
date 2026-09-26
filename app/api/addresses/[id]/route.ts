import { NextResponse } from "next/server";
import { getRequestAuth } from "@/lib/auth-server";
import { addressSchema, deleteAddress, setDefaultAddress, updateAddress } from "@/lib/services/addresses";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function guard(id: string) {
  const user = await getRequestAuth();
  if (!user) return { res: NextResponse.json({ error: "Please sign in" }, { status: 401 }) } as const;
  if (!UUID.test(id)) return { res: NextResponse.json({ error: "Address not found" }, { status: 404 }) } as const;
  return { user } as const;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const g = await guard(params.id);
  if ("res" in g) return g.res;
  const parsed = addressSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid address" }, { status: 400 });
  }
  try {
    const row = await updateAddress(g.user.id, params.id, parsed.data);
    if (!row) return NextResponse.json({ error: "Address not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (e: any) {
    console.error("addresses PUT:", e?.message);
    return NextResponse.json({ error: "Could not update the address" }, { status: 500 });
  }
}

// PATCH { is_default: true } makes this the default address.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const g = await guard(params.id);
  if ("res" in g) return g.res;
  const body = await req.json().catch(() => null);
  if (body?.is_default !== true) {
    return NextResponse.json({ error: "Only { is_default: true } is supported" }, { status: 400 });
  }
  try {
    const row = await setDefaultAddress(g.user.id, params.id);
    if (!row) return NextResponse.json({ error: "Address not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (e: any) {
    console.error("addresses PATCH:", e?.message);
    return NextResponse.json({ error: "Could not set the default address" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const g = await guard(params.id);
  if ("res" in g) return g.res;
  try {
    const ok = await deleteAddress(g.user.id, params.id);
    if (!ok) return NextResponse.json({ error: "Address not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("addresses DELETE:", e?.message);
    return NextResponse.json({ error: "Could not delete the address" }, { status: 500 });
  }
}
