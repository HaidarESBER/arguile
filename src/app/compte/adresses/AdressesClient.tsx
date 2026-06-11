"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui";
import { SavedAddress } from "@/types/user";

type ModalMode = "add" | "edit" | "delete" | null;

const COUNTRIES = [
  { code: "FR", name: "France" },
  { code: "BE", name: "Belgique" },
  { code: "CH", name: "Suisse" },
  { code: "LU", name: "Luxembourg" },
  { code: "DE", name: "Allemagne" },
  { code: "ES", name: "Espagne" },
  { code: "IT", name: "Italie" },
];

const LABEL_OPTIONS = ["Domicile", "Bureau", "Autre"];

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(
    null
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    label: "Domicile",
    firstName: "",
    lastName: "",
    address: "",
    address2: "",
    city: "",
    postalCode: "",
    country: "FR",
    phone: "",
    isDefault: false,
  });

  const showMessage = useCallback((type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  const fetchAddresses = useCallback(async () => {
    try {
      const response = await fetch("/api/profile/addresses");
      const data = await response.json();

      if (response.status === 401) {
        router.push("/compte");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la récupération des adresses");
      }

      setAddresses(data.addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      showMessage("error", "Erreur lors du chargement des adresses");
    } finally {
      setIsLoading(false);
    }
  }, [router, showMessage]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const resetForm = () => {
    setFormData({
      label: "Domicile",
      firstName: "",
      lastName: "",
      address: "",
      address2: "",
      city: "",
      postalCode: "",
      country: "FR",
      phone: "",
      isDefault: false,
    });
  };

  const openAddModal = () => {
    resetForm();
    setSelectedAddress(null);
    setModalMode("add");
  };

  const openEditModal = (address: SavedAddress) => {
    setFormData({
      label: address.label,
      firstName: address.firstName,
      lastName: address.lastName,
      address: address.address,
      address2: address.address2 || "",
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setSelectedAddress(address);
    setModalMode("edit");
  };

  const openDeleteModal = (address: SavedAddress) => {
    setSelectedAddress(address);
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedAddress(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url =
        modalMode === "edit"
          ? "/api/profile/addresses"
          : "/api/profile/addresses";
      const method = modalMode === "edit" ? "PATCH" : "POST";

      const payload =
        modalMode === "edit"
          ? { ...formData, id: selectedAddress?.id }
          : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      setAddresses(data.addresses);
      showMessage(
        "success",
        modalMode === "edit"
          ? "Adresse modifiée avec succès"
          : "Adresse ajoutée avec succès"
      );
      closeModal();
    } catch (error) {
      console.error("Error saving address:", error);
      showMessage(
        "error",
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAddress) return;

    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/profile/addresses?id=${selectedAddress.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      setAddresses(data.addresses);
      showMessage("success", "Adresse supprimée avec succès");
      closeModal();
    } catch (error) {
      console.error("Error deleting address:", error);
      showMessage(
        "error",
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsSaving(false);
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              Mes Adresses
            </h1>
            <p className="text-muted">
              Gérez vos adresses de livraison enregistrées
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-accent text-background font-medium px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors"
          >
            Ajouter une adresse
          </button>
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

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background-secondary/30 border border-border rounded-xl p-12 text-center"
          >
            <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              Aucune adresse sauvegardée
            </h3>
            <p className="text-muted mb-6">
              Ajoutez une adresse pour faciliter vos futures commandes
            </p>
            <button
              onClick={openAddModal}
              className="inline-block bg-accent text-background font-medium px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors"
            >
              Ajouter ma première adresse
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {addresses.map((address, index) => (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-background-secondary/30 border border-border rounded-xl p-6 hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-primary">
                          {address.label}
                        </h3>
                        {address.isDefault && (
                          <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
                            Par défaut
                          </span>
                        )}
                      </div>
                      <p className="text-primary">
                        {address.firstName} {address.lastName}
                      </p>
                      <p className="text-muted text-sm mt-1">
                        {address.address}
                        {address.address2 && `, ${address.address2}`}
                      </p>
                      <p className="text-muted text-sm">
                        {address.postalCode} {address.city}
                      </p>
                      <p className="text-muted text-sm">{address.country}</p>
                      <p className="text-muted text-sm mt-1">
                        Tél: {address.phone}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(address)}
                        className="text-sm text-accent hover:underline"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => openDeleteModal(address)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {(modalMode === "add" || modalMode === "edit") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={closeModal}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-background rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-primary mb-6">
                  {modalMode === "add"
                    ? "Ajouter une adresse"
                    : "Modifier l'adresse"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Libellé
                    </label>
                    <select
                      value={formData.label}
                      onChange={(e) =>
                        setFormData({ ...formData, label: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      {LABEL_OPTIONS.map((label) => (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Numéro et nom de rue"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Complément d&apos;adresse
                    </label>
                    <input
                      type="text"
                      value={formData.address2}
                      onChange={(e) =>
                        setFormData({ ...formData, address2: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Appartement, étage, etc."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Code postal *
                      </label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) =>
                          setFormData({ ...formData, postalCode: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Ville *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Pays *
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    >
                      {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="+33 6 12 34 56 78"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) =>
                        setFormData({ ...formData, isDefault: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <label
                      htmlFor="isDefault"
                      className="text-sm text-primary cursor-pointer"
                    >
                      Définir comme adresse par défaut
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-6 py-3 rounded-lg border border-border text-primary hover:bg-background-secondary transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 bg-accent text-background font-medium px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving
                        ? "Enregistrement..."
                        : modalMode === "add"
                        ? "Ajouter"
                        : "Modifier"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {modalMode === "delete" && selectedAddress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={closeModal}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-background rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Supprimer l&apos;adresse
                </h2>
                <p className="text-muted mb-6">
                  Êtes-vous sûr de vouloir supprimer l&apos;adresse{" "}
                  <span className="font-medium text-primary">
                    {selectedAddress.label}
                  </span>{" "}
                  ? Cette action est irréversible.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 rounded-lg border border-border text-primary hover:bg-background-secondary transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="flex-1 bg-red-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Suppression..." : "Supprimer"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </main>
  );
}
