import { NextRequest, NextResponse } from "next/server";
import { getOrdersByEmail } from "@/lib/orders";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  // Require authentication
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  // Only allow users to query their own orders (or admins to query any)
  if (email.toLowerCase() !== session.email.toLowerCase() && !session.isAdmin) {
    return NextResponse.json(
      { error: "Forbidden: You can only access your own orders" },
      { status: 403 }
    );
  }

  try {
    const orders = await getOrdersByEmail(email);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders by email:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
