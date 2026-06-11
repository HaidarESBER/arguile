"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui";
import { Order, orderStatusLabels } from "@/types/order";
import { UserSession } from "@/types/user";
import { formatPrice } from "@/types/product";
import { formatDateLong } from "@/lib/date-utils";

type ViewMode = "login" | "register";

export function AccountClient() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("login");

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerFirstName, setRegisterFirstName] = useState("");
  const [registerLastName, setRegisterLastName] = useState("");

  // Check for existing session on mount
  useEffect(() => {
    fetchSession();
  }, []);

  // Re-check session when page becomes visible (handles back button)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !user) {
        fetchSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/orders/by-email?email=${encodeURIComponent(user.email)}`);

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des commandes");
      }

      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  }, [user]);

  // Fetch orders when user is set
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  const fetchSession = async () => {
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();

      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important: include cookies in request
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la connexion");
      }

      // Set user immediately for UX
      setUser(data.user);
      setLoginEmail("");
      setLoginPassword("");

      // Re-fetch session after a brief delay to ensure cookies are set
      setTimeout(() => {
        fetchSession();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important: include cookies in request
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          firstName: registerFirstName,
          lastName: registerLastName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      // Set user immediately for UX
      setUser(data.user);
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterFirstName("");
      setRegisterLastName("");

      // Re-fetch session after a brief delay to ensure cookies are set
      setTimeout(() => {
        fetchSession();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setOrders([]);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "text-green-600 bg-green-50 border-green-200";
      case "shipped":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "processing":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "confirmed":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-muted bg-background-secondary border-border";
    }
  };

  if (isLoading) {
    return (
      <main className="py-12 min-h-screen">
        <Container size="md">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted mt-4">Chargement...</p>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-12 min-h-screen">
      <Container size="md">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary mb-2">
            Mon Compte
          </h1>
          <p className="text-muted">
            {user ? "Consultez vos commandes et suivez leur statut" : "Connectez-vous pour accéder à votre compte"}
          </p>
        </div>

        {/* Login/Register Forms */}
        {!user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background-secondary/30 border border-border rounded-2xl p-8"
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              {/* Toggle between login/register */}
              <div className="flex gap-2 mb-6 bg-background-secondary rounded-lg p-1">
                <button
                  onClick={() => {
                    setViewMode("login");
                    setError(null);
                  }}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                    viewMode === "login"
                      ? "bg-background text-primary font-medium"
                      : "text-muted hover:text-primary"
                  }`}
                >
                  Connexion
                </button>
                <button
                  onClick={() => {
                    setViewMode("register");
                    setError(null);
                  }}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                    viewMode === "register"
                      ? "bg-background text-primary font-medium"
                      : "text-muted hover:text-primary"
                  }`}
                >
                  Inscription
                </button>
              </div>

              {/* Login Form */}
              {viewMode === "login" && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-primary mb-2">
                      Adresse email
                    </label>
                    <input
                      type="email"
                      id="login-email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-primary mb-2">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      id="login-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-background font-semibold py-3 rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Connexion..." : "Se connecter"}
                  </button>
                </motion.form>
              )}

              {/* Register Form */}
              {viewMode === "register" && (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRegister}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="register-firstName" className="block text-sm font-medium text-primary mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        id="register-firstName"
                        value={registerFirstName}
                        onChange={(e) => setRegisterFirstName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Jean"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="register-lastName" className="block text-sm font-medium text-primary mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        id="register-lastName"
                        value={registerLastName}
                        onChange={(e) => setRegisterLastName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Dupont"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="register-email" className="block text-sm font-medium text-primary mb-2">
                      Adresse email
                    </label>
                    <input
                      type="email"
                      id="register-email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="register-password" className="block text-sm font-medium text-primary mb-2">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      id="register-password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="••••••••••••"
                      minLength={12}
                      required
                    />
                    <p className="mt-1 text-xs text-muted">Minimum 12 caractères, avec majuscule, minuscule, chiffre et caractère spécial</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-background font-semibold py-3 rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Inscription..." : "Créer mon compte"}
                  </button>
                </motion.form>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            {/* User Info Bar */}
            <div className="bg-background-secondary/30 border border-border rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-primary">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-muted">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-muted hover:text-primary transition-colors"
              >
                Se déconnecter
              </button>
            </div>

            {/* Orders List */}
            <div>
              <h2 className="text-2xl font-semibold text-primary mb-6">
                Mes Commandes ({orders.length})
              </h2>

              {orders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-background-secondary/30 border border-border rounded-xl p-12 text-center"
                >
                  <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    Aucune commande
                  </h3>
                  <p className="text-muted mb-6">
                    Aucune commande trouvée pour <strong>{user.email}</strong>
                    <br />
                    <span className="text-sm">
                      Les commandes sont liées à l&apos;adresse email utilisée lors du paiement
                    </span>
                  </p>
                  <Link
                    href="/produits"
                    className="inline-block bg-primary text-background font-semibold px-6 py-3 rounded-lg hover:bg-primary-light transition-colors"
                  >
                    Découvrir nos produits
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {orders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-background-secondary/30 border border-border rounded-xl p-6 hover:border-accent/50 transition-colors"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4 pb-4 border-b border-border">
                          <div>
                            <h3 className="font-semibold text-primary mb-1">
                              Commande {order.orderNumber}
                            </h3>
                            <p className="text-sm text-muted">
                              {formatDateLong(order.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {orderStatusLabels[order.status]}
                            </span>
                            <Link
                              href={`/suivi/${order.orderNumber}`}
                              className="text-sm text-accent hover:underline font-medium"
                            >
                              Suivre
                            </Link>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-3 mb-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-background-secondary flex-shrink-0">
                                <Image
                                  src={item.productImage}
                                  alt={item.productName}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-primary truncate">
                                  {item.productName}
                                </p>
                                <p className="text-sm text-muted">
                                  Quantité: {item.quantity}
                                </p>
                              </div>
                              <p className="font-medium text-primary">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Order Total */}
                        <div className="pt-4 border-t border-border">
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-muted">Sous-total</span>
                            <span className="text-primary">{formatPrice(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-muted">Livraison</span>
                            <span className="text-primary">
                              {formatPrice(order.shipping)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center font-semibold text-lg">
                            <span className="text-primary">Total</span>
                            <span className="text-accent">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </>
        )}
      </Container>
    </main>
  );
}
