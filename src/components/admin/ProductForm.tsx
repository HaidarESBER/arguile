"use client";

import { useState, useRef } from "react";
import { Product, ProductCategory, categoryLabels } from "@/types/product";
import { Button } from "@/components/ui/Button";
import { Upload, X, Link as LinkIcon } from "lucide-react";

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (formData: FormData) => Promise<void>;
}

const categories: ProductCategory[] = [
  "chicha",
  "bol",
  "tuyau",
  "charbon",
  "accessoire",
];

interface ImageItem {
  url: string;
  isUploading?: boolean;
}

export function ProductForm({ initialData, onSubmit }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<ImageItem[]>(
    initialData?.images?.map(url => ({ url })) ?? []
  );
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Add images as comma-separated string
    const imageUrls = images.map(img => img.url).join(", ");
    formData.set("images", imageUrls);

    // Validation
    const name = formData.get("name") as string;
    const priceStr = formData.get("price") as string;
    const stockLevelStr = formData.get("stockLevel") as string;

    const newErrors: Record<string, string> = {};

    if (!name || name.trim() === "") {
      newErrors.name = "Le nom est requis";
    }

    if (!priceStr || parseFloat(priceStr) <= 0) {
      newErrors.price = "Le prix doit être positif";
    }

    if (stockLevelStr && parseInt(stockLevelStr) < 0) {
      newErrors.stockLevel = "Le stock ne peut pas être négatif";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upload image file
  const uploadImage = async (file: File) => {
    const tempId = Math.random().toString();
    setImages(prev => [...prev, { url: tempId, isUploading: true }]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Replace temp image with uploaded URL
      setImages(prev =>
        prev.map(img => (img.url === tempId ? { url: data.url } : img))
      );
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "Failed to upload image");
      // Remove temp image
      setImages(prev => prev.filter(img => img.url !== tempId));
    }
  };

  // Handle file input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      await uploadImage(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith("image/")
    );

    for (const file of files) {
      await uploadImage(file);
    }
  };

  // Add URL
  const handleAddUrl = () => {
    if (urlInput.trim()) {
      const urls = urlInput
        .split(",")
        .map(url => url.trim())
        .filter(url => url.length > 0);

      setImages(prev => [...prev, ...urls.map(url => ({ url }))]);
      setUrlInput("");
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Move image
  const moveImage = (index: number, direction: "left" | "right") => {
    const newImages = [...images];
    const newIndex = direction === "left" ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < images.length) {
      [newImages[index], newImages[newIndex]] = [
        newImages[newIndex],
        newImages[index],
      ];
      setImages(newImages);
    }
  };

  // Convert cents to euros for display
  const priceInEuros = initialData ? (initialData.price / 100).toFixed(2) : "";
  const compareAtPriceInEuros = initialData?.compareAtPrice
    ? (initialData.compareAtPrice / 100).toFixed(2)
    : "";

  // Calculate discount percentage
  const getDiscountPercentage = () => {
    if (!initialData?.compareAtPrice || !initialData?.price) return null;
    const discount = Math.round(
      ((initialData.compareAtPrice - initialData.price) /
        initialData.compareAtPrice) *
        100
    );
    return discount > 0 ? discount : null;
  };

  const discount = getDiscountPercentage();

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Main Information Section */}
      <div className="bg-white rounded-lg border border-primary/10 p-6">
        <h3 className="text-lg font-semibold text-primary mb-6 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          Informations principales
        </h3>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-primary mb-2"
            >
              Nom du produit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={initialData?.name ?? ""}
              className={`w-full px-4 py-3 border rounded-lg bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                errors.name ? "border-red-500" : "border-primary/30"
              }`}
              placeholder="Ex: Chicha Crystal Premium"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Short Description */}
          <div>
            <label
              htmlFor="shortDescription"
              className="block text-sm font-medium text-primary mb-2"
            >
              Description courte
            </label>
            <input
              type="text"
              id="shortDescription"
              name="shortDescription"
              defaultValue={initialData?.shortDescription ?? ""}
              className="w-full px-4 py-3 border border-primary/30 rounded-lg bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              placeholder="Ex: Chicha en verre soufflé main, design moderne"
              maxLength={150}
            />
            <p className="mt-1 text-xs text-primary/60">
              Max 150 caractères - Affiché sur les cartes produit
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-primary mb-2"
            >
              Description complète
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={initialData?.description ?? ""}
              className="w-full px-4 py-3 border border-primary/30 rounded-lg bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-y transition-all"
              placeholder="Description détaillée du produit, caractéristiques, utilisation, etc."
            />
            <p className="mt-1 text-xs text-primary/60">
              Supporte le formatage markdown
            </p>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-primary mb-2"
            >
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              defaultValue={initialData?.category ?? "chicha"}
              className="w-full px-4 py-3 border border-primary/30 rounded-lg bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabels[cat]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-white rounded-lg border border-primary/10 p-6">
        <h3 className="text-lg font-semibold text-primary mb-6 flex items-center gap-2">
          <span className="text-2xl">💰</span>
          Prix et promotion
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-primary mb-2"
            >
              Prix de vente (EUR) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0"
                defaultValue={priceInEuros}
                className={`w-full px-4 py-3 border rounded-lg bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                  errors.price ? "border-red-500" : "border-primary/30"
                }`}
                placeholder="49.99"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/60 text-sm">
                €
              </span>
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">{errors.price}</p>
            )}
          </div>

          {/* Compare At Price */}
          <div>
            <label
              htmlFor="compareAtPrice"
              className="block text-sm font-medium text-primary mb-2"
            >
              Prix barré (EUR)
            </label>
            <div className="relative">
              <input
                type="number"
                id="compareAtPrice"
                name="compareAtPrice"
                step="0.01"
                min="0"
                defaultValue={compareAtPriceInEuros}
                className="w-full px-4 py-3 border border-primary/30 rounded-lg bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                placeholder="59.99"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/60 text-sm">
                €
              </span>
            </div>
            <p className="mt-1 text-xs text-primary/60">
              Ancien prix pour afficher une promotion
              {discount && (
                <span className="ml-2 text-accent font-semibold">
                  (-{discount}%)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Stock Section */}
      <div className="bg-white rounded-lg border border-primary/10 p-6">
        <h3 className="text-lg font-semibold text-primary mb-6 flex items-center gap-2">
          <span className="text-2xl">📦</span>
          Stock et disponibilité
        </h3>

        <div className="space-y-6">
          {/* Stock Level */}
          <div>
            <label
              htmlFor="stockLevel"
              className="block text-sm font-medium text-primary mb-2"
            >
              Niveau de stock
            </label>
            <input
              type="number"
              id="stockLevel"
              name="stockLevel"
              min="0"
              defaultValue={initialData?.stockLevel ?? 0}
              className={`w-full px-4 py-3 border rounded-lg bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                errors.stockLevel ? "border-red-500" : "border-primary/30"
              }`}
              placeholder="0"
            />
            {errors.stockLevel && (
              <p className="mt-1 text-sm text-red-500">{errors.stockLevel}</p>
            )}
            <div className="mt-2 text-xs space-y-1">
              <p className="text-red-600">• 0 = Rupture de stock</p>
              <p className="text-orange-600">• 1-5 = Stock urgent</p>
              <p className="text-yellow-600">• 6-10 = Stock limité</p>
              <p className="text-green-600">• 11+ = En stock</p>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6 p-4 bg-secondary/20 rounded-lg">
            {/* In Stock */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="inStock"
                defaultChecked={initialData?.inStock ?? true}
                className="w-5 h-5 rounded border-primary/30 text-accent focus:ring-accent cursor-pointer"
              />
              <span className="text-sm font-medium text-primary">
                Disponible à la vente
              </span>
            </label>

            {/* Featured */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={initialData?.featured ?? false}
                className="w-5 h-5 rounded border-primary/30 text-accent focus:ring-accent cursor-pointer"
              />
              <span className="text-sm font-medium text-primary">
                ⭐ Produit vedette
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Images Section */}
      <div className="bg-white rounded-lg border border-primary/10 p-6">
        <h3 className="text-lg font-semibold text-primary mb-6 flex items-center gap-2">
          <span className="text-2xl">🖼️</span>
          Images du produit
        </h3>

        <div className="space-y-6">
          {/* Upload Mode Toggle */}
          <div className="flex gap-2 p-1 bg-secondary/20 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setUploadMode("upload")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                uploadMode === "upload"
                  ? "bg-background text-primary shadow-sm"
                  : "text-primary/60 hover:text-primary"
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <button
              type="button"
              onClick={() => setUploadMode("url")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                uploadMode === "url"
                  ? "bg-background text-primary shadow-sm"
                  : "text-primary/60 hover:text-primary"
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              URL
            </button>
          </div>

          {/* Upload Area */}
          {uploadMode === "upload" ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-accent bg-accent/5"
                    : "border-primary/20 hover:border-accent/50 hover:bg-secondary/20"
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <p className="text-primary font-medium">
                      Glissez-déposez vos images ici
                    </p>
                    <p className="text-sm text-primary/60 mt-1">
                      ou cliquez pour parcourir
                    </p>
                  </div>
                  <p className="text-xs text-primary/50">
                    PNG, JPG, WebP, GIF jusqu&apos;à 5MB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Ajouter des URLs
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddUrl())}
                  className="flex-1 px-4 py-3 border border-primary/30 rounded-lg bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
                  placeholder="https://exemple.com/image.jpg"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-6 py-3 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors font-medium"
                >
                  Ajouter
                </button>
              </div>
              <p className="mt-1 text-xs text-primary/60">
                Séparez plusieurs URLs par des virgules
              </p>
            </div>
          )}

          {/* Image Gallery */}
          {images.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-primary">
                  Images ({images.length})
                </p>
                <p className="text-xs text-primary/60">
                  Glissez pour réorganiser • La 1ère image est l&apos;image principale
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square rounded-lg overflow-hidden border-2 border-primary/20 bg-secondary/20"
                  >
                    {image.isUploading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
                      </div>
                    ) : (
                      <>
                        <img
                          src={image.url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f0f0f0' width='200' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='sans-serif' font-size='14'%3EImage invalide%3C/text%3E%3C/svg%3E";
                          }}
                        />

                        {/* Main Badge */}
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-accent text-background text-xs px-2 py-1 rounded font-medium shadow-lg">
                            Principal
                          </div>
                        )}

                        {/* Controls */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {/* Move Left */}
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, "left")}
                              className="p-2 bg-white rounded-full hover:bg-accent hover:text-white transition-colors"
                              title="Déplacer à gauche"
                            >
                              ←
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Supprimer"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          {/* Move Right */}
                          {index < images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, "right")}
                              className="p-2 bg-white rounded-full hover:bg-accent hover:text-white transition-colors"
                              title="Déplacer à droite"
                            >
                              →
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-primary/10">
        <Button
          type="submit"
          disabled={isSubmitting || images.some(img => img.isUploading)}
          className="px-8 py-3 text-base"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              Enregistrement...
            </span>
          ) : images.some(img => img.isUploading) ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              Upload en cours...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>✓</span>
              {initialData ? "Mettre à jour" : "Créer le produit"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
