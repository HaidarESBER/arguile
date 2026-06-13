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
import { useLocale } from "@/contexts/LocaleContext";
type TabType = "info" | "security" | "preferences" | "orders";

const ORDER_STATUS_EN: Record<Order["status"], string> = {
  pending_payment: "Awaiting payment",
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Being prepared",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const STRINGS = {
  fr: {
    loading: "Chargement...",
    title: "Mon Profil",
    subtitle: "Gérez vos informations personnelles",
    profileFetchError: "Erreur lors de la récupération du profil",
    profileLoadError: "Erreur lors du chargement du profil",
    updateError: "Erreur lors de la mise à jour",
    genericError: "Une erreur est survenue",
    profileUpdated: "Profil mis à jour avec succès",
    passwordsMismatch: "Les mots de passe ne correspondent pas",
    passwordChangeError: "Erreur lors du changement de mot de passe",
    passwordChanged: "Mot de passe modifié avec succès",
    preferencesUpdated: "Préférences mises à jour avec succès",
    logoutConfirm: "Êtes-vous sûr de vouloir vous déconnecter ?",
    logoutError: "Erreur lors de la déconnexion",
    tabOrders: "Commandes",
    tabInfo: "Informations",
    tabSecurity: "Sécurité",
    tabPreferences: "Préférences",
    noOrdersTitle: "Aucune commande",
    noOrdersText: "Vous n'avez pas encore passé de commande",
    discoverProducts: "Découvrir nos produits",
    order: "Commande",
    track: "Suivre",
    quantity: "Quantité",
    subtotal: "Sous-total",
    shipping: "Livraison",
    total: "Total",
    emailLabel: "Email",
    emailNotEditable: "L'email ne peut pas être modifié",
    firstNameLabel: "Prénom",
    lastNameLabel: "Nom",
    phoneLabel: "Téléphone",
    saving: "Enregistrement...",
    save: "Enregistrer",
    changePassword: "Changer le mot de passe",
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    passwordHint: "Minimum 12 caractères, avec majuscule, minuscule, chiffre et caractère spécial",
    confirmNewPassword: "Confirmer le nouveau mot de passe",
    changing: "Modification...",
    changePasswordSubmit: "Modifier le mot de passe",
    logoutTitle: "Déconnexion",
    logoutText: "Déconnectez-vous de votre compte sur cet appareil.",
    logout: "Se déconnecter",
    prefOrderUpdates: "Notifications de commande",
    prefOrderUpdatesText: "Recevoir des emails sur l'état de vos commandes (confirmation, expédition, livraison)",
    prefPromotions: "Promotions et offres",
    prefPromotionsText: "Recevoir nos offres spéciales et codes de réduction",
    prefMarketing: "Newsletters et actualités",
    prefMarketingText: "Recevoir nos newsletters avec nouveautés, conseils et tendances",
    prefTracking: "Historique de navigation",
    prefTrackingText: "Suivre les produits que je consulte pour personnaliser mes recommandations. Vos données sont privées et supprimées automatiquement après 90 jours.",
    statusLabel: (status: Order["status"]) => orderStatusLabels[status],
    orderDate: (date: string | Date) => formatDateLong(date),
  },
  en: {
    loading: "Loading...",
    title: "My Profile",
    subtitle: "Manage your personal information",
    profileFetchError: "Error while fetching the profile",
    profileLoadError: "Error while loading the profile",
    updateError: "Error while updating",
    genericError: "An error occurred",
    profileUpdated: "Profile updated successfully",
    passwordsMismatch: "Passwords do not match",
    passwordChangeError: "Error while changing the password",
    passwordChanged: "Password changed successfully",
    preferencesUpdated: "Preferences updated successfully",
    logoutConfirm: "Are you sure you want to sign out?",
    logoutError: "Error while signing out",
    tabOrders: "Orders",
    tabInfo: "Information",
    tabSecurity: "Security",
    tabPreferences: "Preferences",
    noOrdersTitle: "No orders",
    noOrdersText: "You have not placed any orders yet",
    discoverProducts: "Discover our products",
    order: "Order",
    track: "Track",
    quantity: "Quantity",
    subtotal: "Subtotal",
    shipping: "Shipping",
    total: "Total",
    emailLabel: "Email",
    emailNotEditable: "The email address cannot be changed",
    firstNameLabel: "First name",
    lastNameLabel: "Last name",
    phoneLabel: "Phone",
    saving: "Saving...",
    save: "Save",
    changePassword: "Change password",
    currentPassword: "Current password",
    newPassword: "New password",
    passwordHint: "Minimum 12 characters, with an uppercase letter, lowercase letter, digit and special character",
    confirmNewPassword: "Confirm new password",
    changing: "Updating...",
    changePasswordSubmit: "Change the password",
    logoutTitle: "Sign out",
    logoutText: "Sign out of your account on this device.",
    logout: "Sign out",
    prefOrderUpdates: "Order notifications",
    prefOrderUpdatesText: "Receive emails about the status of your orders (confirmation, shipping, delivery)",
    prefPromotions: "Promotions and offers",
    prefPromotionsText: "Receive our special offers and discount codes",
    prefMarketing: "Newsletters and news",
    prefMarketingText: "Receive our newsletters with new arrivals, tips and trends",
    prefTracking: "Browsing history",
    prefTrackingText: "Track the products I view to personalize my recommendations. Your data is private and automatically deleted after 90 days.",
    statusLabel: (status: Order["status"]) => ORDER_STATUS_EN[status],
    orderDate: (date: string | Date) => formatDateLong(date, "en"),
  },
} as const;

export default function ProfilePage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = STRINGS[locale];
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
        throw new Error(data.error || t.profileFetchError);
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
      showMessage("error", t.profileLoadError);
    } finally {
      setIsLoading(false);
    }
  }, [router, showMessage, t]);

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
        throw new Error(data.error || t.updateError);
      }

      setUser(data.user);
      showMessage("success", t.profileUpdated);
    } catch (error) {
      console.error("Error updating profile:", error);
      showMessage(
        "error",
        error instanceof Error ? error.message : t.genericError
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      showMessage("error", t.passwordsMismatch);
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
        throw new Error(data.error || t.passwordChangeError);
      }

      showMessage("success", t.passwordChanged);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      showMessage(
        "error",
        error instanceof Error ? error.message : t.genericError
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
        throw new Error(data.error || t.updateError);
      }

      setUser(data.user);
      showMessage("success", t.preferencesUpdated);
    } catch (error) {
      console.error("Error updating preferences:", error);
      showMessage(
        "error",
        error instanceof Error ? error.message : t.genericError
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm(t.logoutConfirm)) {
      return;
    }

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
      showMessage("error", t.logoutError);
    }
  };

  if (isLoading) {
    return (
      <main className="py-12 min-h-screen">
        <Container size="md">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted mt-4">{t.loading}</p>
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
            {t.title}
          </h1>
          <p className="text-muted">{t.subtitle}</p>
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
              {t.tabOrders}
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
              {t.tabInfo}
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex-1 py-4 px-6 font-medium transition-colors whitespace-nowrap ${
                activeTab === "security"
                  ? "bg-background text-primary border-b-2 border-accent"
                  : "text-muted hover:text-primary"
              }`}
            >
              {t.tabSecurity}
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`flex-1 py-4 px-6 font-medium transition-colors whitespace-nowrap ${
                activeTab === "preferences"
                  ? "bg-background text-primary border-b-2 border-accent"
                  : "text-muted hover:text-primary"
              }`}
            >
              {t.tabPreferences}
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
                      {t.noOrdersTitle}
                    </h3>
                    <p className="text-muted mb-6">
                      {t.noOrdersText}
                    </p>
                    <Link
                      href="/produits"
                      className="inline-block bg-accent text-background font-medium px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors"
                    >
                      {t.discoverProducts}
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
                                {t.order} {order.orderNumber}
                              </h3>
                              <p className="text-sm text-muted">
                                {t.orderDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {t.statusLabel(order.status)}
                              </span>
                              <Link
                                href={`/suivi/${order.orderNumber}`}
                                className="text-sm text-accent hover:underline font-medium"
                              >
                                {t.track}
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
                                    {t.quantity}: {item.quantity}
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
                              <span className="text-muted">{t.subtotal}</span>
                              <span className="text-primary">{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm mb-2">
                              <span className="text-muted">{t.shipping}</span>
                              <span className="text-primary">
                                {formatPrice(order.shipping)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center font-semibold text-lg">
                              <span className="text-primary">{t.total}</span>
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
                    {t.emailLabel}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background-secondary text-muted cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-muted">
                    {t.emailNotEditable}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-primary mb-2"
                    >
                      {t.firstNameLabel}
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
                      {t.lastNameLabel}
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
                    {t.phoneLabel}
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
                  {isSaving ? t.saving : t.save}
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
                    {t.changePassword}
                  </h3>

                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-primary mb-2"
                    >
                      {t.currentPassword}
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
                      {t.newPassword}
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
                      {t.passwordHint}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmNewPassword"
                      className="block text-sm font-medium text-primary mb-2"
                    >
                      {t.confirmNewPassword}
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
                    {isSaving ? t.changing : t.changePasswordSubmit}
                  </button>
                </form>

                {/* Logout Section */}
                <div className="pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    {t.logoutTitle}
                  </h3>
                  <p className="text-sm text-muted mb-4">
                    {t.logoutText}
                  </p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full bg-background-secondary text-primary font-medium py-3 rounded-lg hover:bg-border transition-colors border border-border flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    {t.logout}
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
                        {t.prefOrderUpdates}
                      </label>
                      <p className="text-xs text-muted mt-1">
                        {t.prefOrderUpdatesText}
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
                        {t.prefPromotions}
                      </label>
                      <p className="text-xs text-muted mt-1">
                        {t.prefPromotionsText}
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
                        {t.prefMarketing}
                      </label>
                      <p className="text-xs text-muted mt-1">
                        {t.prefMarketingText}
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
                        {t.prefTracking}
                      </label>
                      <p className="text-xs text-muted mt-1">
                        {t.prefTrackingText}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-accent text-background font-medium py-3 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? t.saving : t.save}
                </button>
              </motion.form>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
