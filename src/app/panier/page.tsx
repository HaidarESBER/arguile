"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/types/product";
import { calculateSubtotal, calculateTotalItems } from "@/types/cart";

export default function PanierPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const [promoCode, setPromoCode] = useState("");

  const totalItems = calculateTotalItems(items);
  const subtotal = calculateSubtotal(items);
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const handleApplyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code || isApplyingPromo) return;

    setIsApplyingPromo(true);
    setPromoError("");

    try {
      // Real server-side validation against the promotions table
      const response = await fetch("/api/promotions/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await response.json();

      if (data.valid) {
        setDiscount(data.discountAmount);
        setAppliedCode(data.promotion.code);
        setPromoError("");
        // Persist the code so /commande applies it at checkout
        // (DiscountCodeInput auto-applies "pendingDiscountCode")
        sessionStorage.setItem("pendingDiscountCode", data.promotion.code);
      } else {
        setPromoError(data.error || "Code promo invalide");
        setDiscount(0);
        setAppliedCode(null);
        sessionStorage.removeItem("pendingDiscountCode");
      }
    } catch {
      setPromoError("Erreur lors de la validation du code promo");
      setDiscount(0);
      setAppliedCode(null);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  return (
    <main className="flex-grow w-full max-w-[1600px] mx-auto px-4 md:px-8 py-6 bg-background-dark text-white min-h-screen">
      <h1 className="text-2xl md:text-3xl font-light mb-6 text-white">
        Mon Panier <span className="text-gray-400 text-lg md:text-xl ml-2 font-thin">({totalItems} article{totalItems > 1 ? 's' : ''})</span>
      </h1>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 rounded-full bg-surface-dark flex items-center justify-center mx-auto mb-6">
            <span className="material-icons text-4xl text-gray-400">shopping_cart</span>
          </div>
          <h2 className="text-xl text-white mb-2">Votre panier est vide</h2>
          <p className="text-gray-400 mb-8">Découvrez nos produits et trouvez votre bonheur</p>
          <Link
            href="/produits"
            className="inline-block px-8 py-4 bg-primary hover:bg-primary-light text-background-dark font-bold rounded-full transition-all"
          >
            Voir nos produits
          </Link>
        </motion.div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 relative">
          {/* Left Column: Cart Items */}
          <div className="w-full lg:w-2/3 space-y-8">
            {/* Cart Items List */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-surface-dark/40 backdrop-blur-md border border-white/10 rounded-xl p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative group hover:border-primary/30 transition-colors"
                  >
                    {/* Product Image */}
                    <div className="relative w-full sm:w-[100px] h-[100px] shrink-0 rounded-lg overflow-hidden bg-background-dark">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow flex flex-col md:flex-row justify-between gap-4 w-full">
                      <div className="space-y-0.5">
                        <h3 className="text-base font-medium text-white">{item.product.name}</h3>
                        <p className="text-xs text-gray-400">{item.product.shortDescription}</p>
                        <p className="text-xs text-primary">En stock</p>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-8 mt-2 md:mt-0">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-white/20 rounded-lg">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.product.id, item.quantity - 1);
                              } else {
                                removeItem(item.product.id);
                              }
                            }}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                          >
                            <span className="material-icons text-base">remove</span>
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                          >
                            <span className="material-icons text-base">add</span>
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right min-w-[70px]">
                          <p className="text-base font-semibold text-white">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-gray-400">
                              {formatPrice(item.product.price)} / unité
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.product.id)}
                      aria-label="Supprimer"
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <span className="material-icons-outlined">close</span>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-28 space-y-6">
              <div className="bg-surface-dark/40 backdrop-blur-md border border-white/10 rounded-xl p-6 md:p-8">
                <h2 className="text-xl font-light text-white mb-6 pb-4 border-b border-white/10">Résumé</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Sous-total</span>
                    <span className="font-medium text-white">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-primary">Réduction</span>
                      <span className="font-medium text-primary">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Livraison estimée</span>
                    <span className="text-gray-500 italic text-xs">Calculé à l&apos;étape suivante</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Taxes</span>
                    <span className="font-medium text-white">Incluses</span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        setPromoError("");
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleApplyPromo();
                      }}
                      className="w-full bg-background-dark/50 border border-white/20 rounded-lg py-2.5 px-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-white placeholder-gray-500"
                      placeholder="Code promo"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-primary hover:text-white transition-colors px-2 py-1 disabled:opacity-50"
                    >
                      {isApplyingPromo ? "..." : "APPLIQUER"}
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-red-400 text-xs mt-2">{promoError}</p>
                  )}
                  {appliedCode && discount > 0 && (
                    <p className="text-primary text-xs mt-2">
                      ✓ Code {appliedCode} appliqué : -{formatPrice(discount)}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-end mb-8 pt-6 border-t border-white/10">
                  <span className="text-base font-medium text-white">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-semibold text-primary">{formatPrice(subtotal - discount)}</span>
                  </div>
                </div>

                <Link
                  href="/commande"
                  className="block w-full bg-primary hover:bg-primary-light text-background-dark font-medium py-4 px-6 rounded-lg transition-all transform active:scale-[0.99] text-center"
                >
                  Procéder au Paiement
                </Link>

                <div className="mt-6 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3 text-gray-500">
                    <span className="material-icons-outlined text-xl">verified_user</span>
                    <span className="material-icons-outlined text-xl">local_shipping</span>
                    <span className="material-icons-outlined text-xl">replay</span>
                  </div>
                  <p className="text-xs text-center text-gray-600">
                    Paiement sécurisé. Retours gratuits sous 30 jours.
                  </p>
                </div>
              </div>

              {/* Help Card */}
              <div className="bg-surface-dark/40 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <span className="material-icons-outlined">support_agent</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Besoin d&apos;aide ?</p>
                  <p className="text-xs text-gray-400">Contactez notre support au 01 23 45 67 89</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
