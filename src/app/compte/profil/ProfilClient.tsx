"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui";
import { UserSession, EmailPreferences } from "@/types/user";
import { Order, orderStatusLabels } from "@/types/order";
import { formatPrice } from "@/types/product";
import { formatDateLong } from "@/lib/date-utils";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
type TabType = "info" | "security" | "preferences" | "orders";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [user, setUser] = useState<UserSession | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Info form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Security form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Preferences form
  const [preferences, setPreferences] = useState<EmailPreferences>({
    email_marketing: false,
    email_order_updates: true,
    email_promotions: false,
    track_browsing: true,
  });

  const showMessage = useCallback((type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/profile", {
        credentials: "include",
      });
      const data = await response.json();

      if (response.status === 401) {
        router.push("/compte");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la récupération du profil");
      }

      setUser(data.user);
      setFirstName(data.user.firstName);
      setLastName(data.user.lastName);
      setPhone(data.user.phone || "");
      setPreferences(
        data.user.preferences || {
          email_marketing: false,
          email_order_updates: true,
          email_promotions: false,
          track_browsing: true,
        }
      );
    } catch (error) {
      console.error("Error fetching profile:", error);
      showMessage("error", "Erreur lors du chargement du profil");
    } finally {
      setIsLoading(false);
    }
  }, [router, showMessage]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/orders/by-email?email=${encodeURIComponent(user.email)}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des commandes");
      }

      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Re-check session when page becomes visible (handles back button)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !user) {
        fetchProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, fetchProfile]);

  // Fetch orders when user is set
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

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

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      setUser(data.user);
      showMessage("success", "Profil mis à jour avec succès");
    } catch (error) {
      console.error("Error updating profile:", error);
      showMessage(
        "error",
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      showMessage("error", "Les mots de passe ne correspondent pas");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du changement de mot de passe");
      }

      showMessage("success", "Mot de passe modifié avec succès");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      showMessage(
        "error",
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          preferences,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      setUser(data.user);
      showMessage("success", "Préférences mises à jour avec succès");
    } catch (error) {
      console.error("Error updating preferences:", error);
      showMessage(
        "error",
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      return;
    }

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
      showMessage("error", "Erreur lors de la déconnexion");
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
            Mon Profil
          </h1>
          <p className="text-muted">Gérez vos informations personnelles</p>
        </div>

        {/* Toast Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-6 p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="bg-background-secondary/30 border border-border rounded-xl overflow-hidden">
          <div className="flex border-b border-border overflow-x-auto">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 py-4 px-6 font-medium transition-colors whitespace-nowrap ${
                activeTab === "orders"
                  ? "bg-background text-primary border-b-2 border-accent"
                  : "text-muted hover:text-primary"
              }`}
            >
              Commandes
              {orders.length > 0 && (
                <span className="ml-2 text-xs text-muted">({orders.length})</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`flex-1 py-4 px-6 font-medium transition-colors whitespace-nowrap ${
                activeTab === "info"
                  ? "bg-background text-primary border-b-2 border-accent"
                  : "text-muted hover:text-primary"
              }`}
            >
              Informations
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex-1 py-4 px-6 font-medium transition-colors whitespace-nowrap ${
                activeTab === "security"
                  ? "bg-background text-primary border-b-2 border-accent"
                  : "text-muted hover:text-primary"
              }`}
            >
              Sécurité
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`flex-1 py-4 px-6 font-medium transition-colors whitespace-nowrap ${
                activeTab === "preferences"
                  ? "bg-background text-primary border-b-2 border-accent"
                  : "text-muted hover:text-primary"
              }`}
            >
              Préférences
            </button>
          </div>

          <div className="p-8">
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      Aucune commande
                    </h3>
                    <p className="text-muted mb-6">
                      Vous n&apos;avez pas encore passé de commande
                    </p>
                    <Link
                      href="/produits"
                      className="inline-block bg-accent text-background font-medium px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors"
                    >
                      Découvrir nos produits
                    </Link>
                  </div>
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
              </motion.div>
            )}

            {/* Informations Tab */}
            {activeTab === "info" && (
              <motion.form
                key="info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSaveInfo}
                className="space-y-6 max-w-lg"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-primary mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background-secondary text-muted cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-muted">
                    L&apos;email ne peut pas être modifié
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-primary mb-2"
                    >
                      Prénom
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-primary mb-2"
                    >
                      Nom
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-primary mb-2"
                  >
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-accent text-background font-medium py-3 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </motion.form>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 max-w-lg"
              >
                {/* Change Password Form */}
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <h3 className="text-lg font-semibold text-primary">
                    Changer le mot de passe
                  </h3>

                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-primary mb-2"
                    >
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-primary mb-2"
                    >
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      minLength={12}
                      required
                    />
                    <p className="mt-1 text-xs text-muted">
                      Minimum 12 caractères, avec majuscule, minuscule, chiffre et
                      caractère spécial
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmNewPassword"
                      className="block text-sm font-medium text-primary mb-2"
                    >
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      id="confirmNewPassword"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      minLength={12}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-accent text-background font-medium py-3 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Modification..." : "Modifier le mot de passe"}
                  </button>
                </form>

                {/* Logout Section */}
                <div className="pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    Déconnexion
                  </h3>
                  <p className="text-sm text-muted mb-4">
                    Déconnectez-vous de votre compte sur cet appareil.
                  </p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full bg-background-secondary text-primary font-medium py-3 rounded-lg hover:bg-border transition-colors border border-border flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Se déconnecter
                  </button>
                </div>
              </motion.div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <motion.form
                key="preferences"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSavePreferences}
                className="space-y-6 max-w-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="email_order_updates"
                      checked={preferences.email_order_updates}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          email_order_updates: e.target.checked,
                        })
                      }
                      className="mt-1 w-4 h-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <div>
                      <label
                        htmlFor="email_order_updates"
                        className="text-sm font-medium text-primary cursor-pointer"
                      >
                        Notifications de commande
                      </label>
                      <p className="text-xs text-muted mt-1">
                        Recevoir des emails sur l&apos;état de vos commandes
                        (confirmation, expédition, livraison)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="email_promotions"
                      checked={preferences.email_promotions}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          email_promotions: e.target.checked,
                        })
                      }
                      className="mt-1 w-4 h-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <div>
                      <label
                        htmlFor="email_promotions"
                        className="text-sm font-medium text-primary cursor-pointer"
                      >
                        Promotions et offres
                      </label>
                      <p className="text-xs text-muted mt-1">
                        Recevoir nos offres spéciales et codes de réduction
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="email_marketing"
                      checked={preferences.email_marketing}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          email_marketing: e.target.checked,
                        })
                      }
                      className="mt-1 w-4 h-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <div>
                      <label
                        htmlFor="email_marketing"
                        className="text-sm font-medium text-primary cursor-pointer"
                      >
                        Newsletters et actualités
                      </label>
                      <p className="text-xs text-muted mt-1">
                        Recevoir nos newsletters avec nouveautés, conseils et
                        tendances
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="track_browsing"
                      checked={preferences.track_browsing}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          track_browsing: e.target.checked,
                        })
                      }
                      className="mt-1 w-4 h-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <div>
                      <label
                        htmlFor="track_browsing"
                        className="text-sm font-medium text-primary cursor-pointer"
                      >
                        Historique de navigation
                      </label>
                      <p className="text-xs text-muted mt-1">
                        Suivre les produits que je consulte pour personnaliser mes
                        recommandations. Vos données sont privées et supprimées
                        automatiquement après 90 jours.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-accent text-background font-medium py-3 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </motion.form>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
