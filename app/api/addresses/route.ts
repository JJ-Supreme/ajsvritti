import { NextResponse } from "next/server";
import { getRequestAuth } from "@/lib/auth-server";
import { addressSchema, createAddress, listAddresses } from "@/lib/services/addresses";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getRequestAuth();
  if (!user) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  try {
    return NextResponse.json(await listAddresses(user.id));
  } catch (e: any) {
    console.error("addresses GET:", e?.message);
    return NextResponse.json({ error: "Could not load your addresses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getRequestAuth();
  if (!user) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const parsed = addressSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid address" }, { status: 400 });
  }
  try {
    return NextResponse.json(await createAddress(user.id, parsed.data), { status: 201 });
  } catch (e: any) {
    console.error("addresses POST:", e?.message);
    return NextResponse.json({ error: "Could not save the address" }, { status: 500 });
  }
}
