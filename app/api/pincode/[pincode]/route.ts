import { lookupPincode, isValidIndianPincode } from "@/lib/pincode-lookup";
import { NextResponse } from "next/server";

export const revalidate = 60 * 60 * 24 * 30;

export async function GET(
  _req: Request,
  { params }: { params: { pincode: string } }
) {
  const pincode = params.pincode;

  if (!isValidIndianPincode(pincode)) {
    return NextResponse.json(
      { error: "Pincode must be a valid 6-digit Indian PIN code" },
      { status: 400 }
    );
  }

  try {
    const postOffices = await lookupPincode(pincode);

    if (postOffices.length === 0) {
      return NextResponse.json(
        {
          status: "not_found",
          message: "No post offices found for this pincode",
          postOffices: [],
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: `Number of pincode(s) found: ${postOffices.length}`,
        postOffices,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("PIN code lookup error:", error);
    return NextResponse.json(
      { error: "Unable to fetch post office details. Please try again." },
      { status: 502 }
    );
  }
}
