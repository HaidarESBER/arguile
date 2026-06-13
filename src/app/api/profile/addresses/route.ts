import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { SavedAddress } from "@/types/user";
import { assertSameOrigin } from "@/lib/security";

const STRINGS = {
  fr: {
    requiredFields: "Tous les champs obligatoires doivent être remplis",
    postalCode: "Le code postal doit contenir 5 chiffres",
  },
  en: {
    requiredFields: "All required fields must be filled in",
    postalCode: "The postal code must contain 5 digits",
  },
} as const;

function getRequestLocale(request: NextRequest): "fr" | "en" {
  const v = request.cookies.get("locale")?.value;
  return v === "en" ? "en" : "fr";
}

/**
 * GET /api/profile/addresses
 * Fetch user's saved addresses
 */
export async function GET() {
  try {
    const session = await requireAuth();
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("saved_addresses")
      .eq("id", session.id)
      .single();

    if (error) {
      console.error("Error fetching addresses:", error);
      return NextResponse.json(
        { error: "Failed to fetch addresses" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      addresses: profile?.saved_addresses || [],
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile/addresses
 * Add new address to saved addresses
 */
export async function POST(request: NextRequest) {
  const t = STRINGS[getRequestLocale(request)];

  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const session = await requireAuth();
    const supabase = await createClient();

    const body = await request.json();

    // Validate required fields
    if (
      !body.firstName ||
      !body.lastName ||
      !body.address ||
      !body.city ||
      !body.postalCode ||
      !body.country ||
      !body.phone
    ) {
      return NextResponse.json(
        { error: t.requiredFields },
        { status: 400 }
      );
    }

    // Validate French postal code format if country is FR
    if (body.country === "FR" && !/^\d{5}$/.test(body.postalCode)) {
      return NextResponse.json(
        { error: t.postalCode },
        { status: 400 }
      );
    }

    // Fetch current addresses
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("saved_addresses")
      .eq("id", session.id)
      .single();

    if (fetchError) {
      console.error("Error fetching addresses:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch addresses" },
        { status: 500 }
      );
    }

    const currentAddresses: SavedAddress[] = profile?.saved_addresses || [];

    // Create new address with generated ID
    const newAddress: SavedAddress = {
      id: crypto.randomUUID(),
      label: body.label || "Domicile",
      firstName: body.firstName,
      lastName: body.lastName,
      address: body.address,
      address2: body.address2 || undefined,
      city: body.city,
      postalCode: body.postalCode,
      country: body.country,
      phone: body.phone,
      isDefault: body.isDefault || false,
    };

    // If this address is set as default, unset all others
    let updatedAddresses = currentAddresses;
    if (newAddress.isDefault) {
      updatedAddresses = currentAddresses.map((addr) => ({
        ...addr,
        isDefault: false,
      }));
    }

    // Add new address
    updatedAddresses.push(newAddress);

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ saved_addresses: updatedAddresses })
      .eq("id", session.id);

    if (updateError) {
      console.error("Error updating addresses:", updateError);
      return NextResponse.json(
        { error: "Failed to save address" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      addresses: updatedAddresses,
    });
  } catch (error) {
    console.error("Error adding address:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile/addresses
 * Update existing address
 */
export async function PATCH(request: NextRequest) {
  const t = STRINGS[getRequestLocale(request)];

  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const session = await requireAuth();
    const supabase = await createClient();

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Address ID is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (
      !body.firstName ||
      !body.lastName ||
      !body.address ||
      !body.city ||
      !body.postalCode ||
      !body.country ||
      !body.phone
    ) {
      return NextResponse.json(
        { error: t.requiredFields },
        { status: 400 }
      );
    }

    // Validate French postal code format if country is FR
    if (body.country === "FR" && !/^\d{5}$/.test(body.postalCode)) {
      return NextResponse.json(
        { error: t.postalCode },
        { status: 400 }
      );
    }

    // Fetch current addresses
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("saved_addresses")
      .eq("id", session.id)
      .single();

    if (fetchError) {
      console.error("Error fetching addresses:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch addresses" },
        { status: 500 }
      );
    }

    let addresses: SavedAddress[] = profile?.saved_addresses || [];

    // Find and update the address
    const addressIndex = addresses.findIndex((addr) => addr.id === body.id);

    if (addressIndex === -1) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // If this address is being set as default, unset all others
    if (body.isDefault) {
      addresses = addresses.map((addr) => ({
        ...addr,
        isDefault: false,
      }));
    }

    // Update the address
    addresses[addressIndex] = {
      id: body.id,
      label: body.label || "Domicile",
      firstName: body.firstName,
      lastName: body.lastName,
      address: body.address,
      address2: body.address2 || undefined,
      city: body.city,
      postalCode: body.postalCode,
      country: body.country,
      phone: body.phone,
      isDefault: body.isDefault || false,
    };

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ saved_addresses: addresses })
      .eq("id", session.id);

    if (updateError) {
      console.error("Error updating addresses:", updateError);
      return NextResponse.json(
        { error: "Failed to update address" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("Error updating address:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/addresses
 * Remove address from saved addresses
 */
export async function DELETE(request: NextRequest) {
  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const session = await requireAuth();
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get("id");

    if (!addressId) {
      return NextResponse.json(
        { error: "Address ID is required" },
        { status: 400 }
      );
    }

    // Fetch current addresses
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("saved_addresses")
      .eq("id", session.id)
      .single();

    if (fetchError) {
      console.error("Error fetching addresses:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch addresses" },
        { status: 500 }
      );
    }

    const addresses: SavedAddress[] = profile?.saved_addresses || [];

    // Remove the address
    const updatedAddresses = addresses.filter((addr) => addr.id !== addressId);

    if (updatedAddresses.length === addresses.length) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ saved_addresses: updatedAddresses })
      .eq("id", session.id);

    if (updateError) {
      console.error("Error updating addresses:", updateError);
      return NextResponse.json(
        { error: "Failed to delete address" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      addresses: updatedAddresses,
    });
  } catch (error) {
    console.error("Error deleting address:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
