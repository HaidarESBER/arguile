import { NextRequest, NextResponse } from "next/server";
import { validatePromotion } from "@/lib/promotions";
import { calculateDiscount, formatDiscount } from "@/types/promotion";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal } = body as { code: string; subtotal: number };

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, error: "Code promo requis" },
        { status: 400 }
      );
    }

    if (typeof subtotal !== "number" || subtotal < 0) {
      return NextResponse.json(
        { valid: false, error: "Sous-total invalide" },
        { status: 400 }
      );
    }

    const result = await validatePromotion(code, subtotal);

    if (!result.valid || !result.promotion) {
      return NextResponse.json({
        valid: false,
        error: result.error || "Code promo introuvable",
      });
    }

    const promotion = result.promotion;
    const discountAmount = calculateDiscount(subtotal, promotion);

    return NextResponse.json({
      valid: true,
      promotion: {
        id: promotion.id,
        code: promotion.code,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        description: promotion.description,
      },
      discountAmount,
      label: `${promotion.code} : ${formatDiscount(promotion)}`,
    });
  } catch (error) {
    console.error("Promotion validation error:", error);
    return NextResponse.json(
      { valid: false, error: "Erreur lors de la validation du code promo" },
      { status: 500 }
    );
  }
}
