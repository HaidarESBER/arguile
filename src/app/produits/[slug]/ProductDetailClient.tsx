"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Product, categoryLabels } from "@/types/product";
import { Review, ProductRatingStats } from "@/data/reviews";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/types/product";
import { ReviewSubmitModal } from "@/components/product/ReviewSubmitModal";

interface ProductDetailClientProps {
  product: Product;
  /** Same-category recommendations, computed server-side */
  relatedProducts: Product[];
  /** Cross-category recommendations, computed server-side */
  complementaryProducts: Product[];
  reviews: Review[];
  stats: ProductRatingStats | null;
}

export function ProductDetailClient({ product, relatedProducts, complementaryProducts, reviews, stats }: ProductDetailClientProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [reviewsToShow, setReviewsToShow] = useState(4);
  const [reviewSort, setReviewSort] = useState<'relevance' | 'recent'>('relevance');
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [reviewImageLightbox, setReviewImageLightbox] = useState<{ isOpen: boolean; images: string[]; currentIndex: number }>({
    isOpen: false,
    images: [],
    currentIndex: 0
  });
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [mobileReviewsExpanded, setMobileReviewsExpanded] = useState(false);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { addItem } = useCart();

  const MAX_VISIBLE_THUMBNAILS = 5;

  // Minimum swipe distance (in px) to trigger image change
  const MIN_SWIPE_DISTANCE = 50;

  // Swipe handlers for mobile image carousel
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

    if (isLeftSwipe && selectedImageIndex < product.images.length - 1) {
      // Swipe left - next image
      setSelectedImageIndex(prev => prev + 1);
    } else if (isRightSwipe && selectedImageIndex > 0) {
      // Swipe right - previous image
      setSelectedImageIndex(prev => prev - 1);
    }
  };

  // Sort all reviews
  const sortedReviews = [...reviews]
    .sort((a, b) => {
      if (reviewSort === 'recent') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      // Relevance: verified purchases first, then by rating
      if (a.verifiedPurchase !== b.verifiedPurchase) {
        return a.verifiedPurchase ? -1 : 1;
      }
      return b.rating - a.rating;
    });

  const hasDiscount = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);

  const handleAddToCart = () => {
    if (product.inStock) {
      addItem(product, quantity);
      setJustAdded(true);
      setShowAddedToast(true);
      setTimeout(() => {
        setJustAdded(false);
        setShowAddedToast(false);
      }, 2000);
    }
  };

  const handleBuyNow = () => {
    if (product.inStock) {
      addItem(product, quantity);
      router.push('/commande');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.shortDescription,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Lien copié dans le presse-papiers!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const visibleThumbnails = product.images.slice(0, MAX_VISIBLE_THUMBNAILS - 1);
  const remainingImagesCount = product.images.length - MAX_VISIBLE_THUMBNAILS + 1;
  const hasMoreImages = product.images.length > MAX_VISIBLE_THUMBNAILS;

  const openLightbox = (index: number) => {
    setLightboxImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const nextImage = useCallback(() => {
    setLightboxImageIndex((prev) => (prev + 1) % product.images.length);
  }, [product.images.length]);

  const prevImage = useCallback(() => {
    setLightboxImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  }, [product.images.length]);

  // Review image lightbox handlers
  const openReviewImageLightbox = (images: string[], startIndex: number) => {
    setReviewImageLightbox({ isOpen: true, images, currentIndex: startIndex });
  };

  const closeReviewImageLightbox = () => {
    setReviewImageLightbox({ isOpen: false, images: [], currentIndex: 0 });
  };

  const nextReviewImage = () => {
    setReviewImageLightbox(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length
    }));
  };

  const prevReviewImage = () => {
    setReviewImageLightbox(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
    }));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, closeLightbox, nextImage, prevImage]);

  // Keyboard navigation for review image lightbox
  useEffect(() => {
    if (!reviewImageLightbox.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeReviewImageLightbox();
      if (e.key === "ArrowRight") nextReviewImage();
      if (e.key === "ArrowLeft") prevReviewImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reviewImageLightbox]);

  return (
    <div className="bg-background-dark min-h-screen text-[0.85rem]">
      {/* MOBILE VERSION */}
      <div className="lg:hidden pt-2">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="px-3 mb-2 text-[10px] text-gray-400">
          <ol className="inline-flex items-center space-x-1">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-primary transition-colors">
                Accueil
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-icons text-gray-600 text-xs mx-1">chevron_right</span>
                <Link href="/produits" className="hover:text-primary transition-colors">
                  Produits
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-icons text-gray-600 text-xs mx-1">chevron_right</span>
                <Link href={`/produits?category=${product.category}`} className="text-gray-400 hover:text-primary transition-colors">
                  {categoryLabels[product.category]}
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-icons text-gray-600 text-xs mx-1">chevron_right</span>
                <span className="text-primary font-medium truncate max-w-[120px]">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Hero Image */}
        <section
          className="relative h-[45vh] w-full overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Back Button - On top of image */}
          <div className="absolute top-3 left-3 z-20">
            <Link
              href="/produits"
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-white hover:border-primary/50 transition-all shadow-lg hover:shadow-[0_4px_24px_rgba(18,222,38,0.3)] active:scale-95"
            >
              <span className="material-icons text-lg group-hover:text-primary transition-colors">arrow_back</span>
            </Link>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedImageIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="relative w-full h-full"
            >
              <Image
                src={product.images[selectedImageIndex]}
                alt={product.name}
                fill
                sizes="100vw"
                priority={selectedImageIndex === 0}
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background-dark to-transparent pointer-events-none"></div>

          {/* Carousel Indicators */}
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`rounded-full transition-all ${
                    index === selectedImageIndex
                      ? "w-6 h-1 bg-primary"
                      : "w-1.5 h-1 bg-white/30 backdrop-blur-sm"
                  }`}
                />
              ))}
            </div>
          )}

          {product.featured && (
            <div className="absolute bottom-4 left-4 z-10">
              <span className="bg-primary/90 text-background-dark text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                Nouveau
              </span>
            </div>
          )}
        </section>

        {/* Product Info */}
        <main className="px-3 py-3 pb-28">
          <h1 className="text-lg font-bold leading-tight tracking-tight mb-2">{product.name}</h1>

          {/* Price & Rating */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-primary text-base font-bold">{formatPrice(product.price)}</span>
              {hasDiscount && product.compareAtPrice && (
                <span className="text-[10px] text-gray-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            {stats && (
              <div className="flex items-center gap-0.5 bg-surface-dark px-2 py-0.5 rounded-full border border-white/5">
                <span className="material-icons text-primary text-[10px]">star</span>
                <span className="text-[10px] font-medium">{stats.averageRating.toFixed(1)}</span>
                <span className="text-[9px] text-gray-400 ml-0.5">({stats.totalReviews})</span>
              </div>
            )}
          </div>

          {/* Action Buttons - Add to cart & Share (favorites flow hidden) */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-light text-background-dark font-semibold rounded-lg transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-icons text-sm" aria-hidden="true">
                {justAdded ? "check" : "add_shopping_cart"}
              </span>
              <span>{justAdded ? "Ajouté" : "Ajouter au panier"}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-dark hover:bg-surface-dark/80 border border-white/10 hover:border-primary/30 rounded-lg transition-all text-white text-xs"
            >
              <span className="material-icons text-sm" aria-hidden="true">share</span>
              <span>Partager</span>
            </button>
          </div>

          {/* Short Description */}
          <p className="text-gray-400 text-[10px] leading-relaxed mb-4">{product.shortDescription}</p>

          {/* Accordions */}
          <div className="space-y-2 mb-4">
            <details className="group bg-surface-dark rounded-lg border border-white/5">
              <summary className="flex justify-between items-center p-2.5 cursor-pointer list-none">
                <span className="font-medium text-xs text-gray-200">Description</span>
                <span className="material-icons text-xs text-gray-400 group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <div className="px-2.5 pb-2.5 text-[10px] text-gray-400 border-t border-white/5 pt-2">
                <p>{product.description}</p>
              </div>
            </details>

            <details className="group bg-surface-dark rounded-lg border border-white/5">
              <summary className="flex justify-between items-center p-2.5 cursor-pointer list-none">
                <span className="font-medium text-xs text-gray-200">Caractéristiques</span>
                <span className="material-icons text-xs text-gray-400 group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <div className="px-2.5 pb-2.5 text-[10px] text-gray-400 border-t border-white/5 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[9px] text-gray-500 uppercase">Catégorie</span>
                    <span className="text-white text-[10px]">{product.category}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 uppercase">Stock</span>
                    <span className={`text-[10px] ${product.inStock ? "text-primary" : "text-red-400"}`}>
                      {product.inStock ? "Disponible" : "Rupture"}
                    </span>
                  </div>
                </div>
              </div>
            </details>

            {/* Reviews Accordion */}
            {reviews.length > 0 && (
              <details className="group bg-surface-dark rounded-lg border border-white/5">
                <summary className="flex justify-between items-center p-2.5 cursor-pointer list-none">
                  <span className="font-medium text-xs text-gray-200">Avis clients ({reviews.length})</span>
                  <span className="material-icons text-xs text-gray-400 group-open:rotate-180 transition-transform">
                    expand_more
                  </span>
                </summary>
                <div className="px-2.5 pb-2.5 border-t border-white/5 pt-2 space-y-2">
                  {reviews.slice(0, mobileReviewsExpanded ? reviews.length : 3).map((review) => (
                    <div key={review.id} className="pb-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex text-primary">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="material-icons text-[9px]">
                              {i < review.rating ? "star" : "star_border"}
                            </span>
                          ))}
                        </div>
                        <span className="text-[9px] text-gray-500">
                          {new Date(review.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-[10px] font-medium text-white mb-0.5">{review.authorName}</p>
                      <p className="text-[10px] text-gray-400 mb-1">{review.comment}</p>

                      {/* Review Photos */}
                      {review.photos && review.photos.length > 0 && (
                        <div className="flex gap-1 mt-1.5">
                          {review.photos.slice(0, 3).map((photo, idx) => (
                            <div
                              key={idx}
                              onClick={() => openReviewImageLightbox(review.photos!, idx)}
                              className="w-12 h-12 rounded-md overflow-hidden border border-white/10 hover:border-primary/50 transition-colors cursor-pointer"
                            >
                              <img
                                src={photo}
                                alt={`Photo ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {review.photos.length > 3 && (
                            <div
                              onClick={() => openReviewImageLightbox(review.photos!, 3)}
                              className="w-12 h-12 rounded-md bg-background-dark border border-white/10 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                            >
                              <span className="text-[9px] text-gray-400">+{review.photos.length - 3}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Voir plus / Voir moins button */}
                  {reviews.length > 3 && (
                    <div className="pt-2">
                      <button
                        onClick={() => setMobileReviewsExpanded(!mobileReviewsExpanded)}
                        className="w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg text-xs font-medium transition-all"
                      >
                        {mobileReviewsExpanded ? "Voir moins" : `Voir plus (${reviews.length - 3})`}
                      </button>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>

          {/* Related Products - Mobile */}
          {relatedProducts.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
                Produits similaires
                <span className="w-0.5 h-0.5 rounded-full bg-primary animate-pulse"></span>
              </h3>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-3 px-3 mb-3">
                {relatedProducts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/produits/${item.slug}`}
                    className="flex-none w-24 group"
                  >
                    <div className="relative w-24 h-24 rounded-lg bg-surface-dark border border-white/5 overflow-hidden mb-1.5 group-hover:border-primary/50 transition-colors">
                      <Image src={item.images[0]} alt={item.name} fill sizes="96px" className="object-cover" />
                    </div>
                    <p className="text-[10px] font-medium text-white truncate">{item.name}</p>
                    <p className="text-[9px] text-primary font-bold">{formatPrice(item.price)}</p>
                  </Link>
                ))}
              </div>

              {/* Voir plus button */}
              <Link
                href={`/produits?categorie=${product.category}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg text-xs font-medium transition-all"
              >
                Voir plus de produits
                <span className="material-icons text-sm">arrow_forward</span>
              </Link>
            </div>
          )}

          {/* Complementary Products - Mobile */}
          {complementaryProducts.length > 0 && (
            <div className="mb-4">
              <div className="mb-2">
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  Complétez votre achat
                  <span className="w-0.5 h-0.5 rounded-full bg-primary animate-pulse"></span>
                </h3>
                <p className="text-[9px] text-gray-400">Fréquemment achetés ensemble</p>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-3 px-3 mb-3">
                {complementaryProducts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/produits/${item.slug}`}
                    className="flex-none w-24 group"
                  >
                    <div className="relative w-24 h-24 rounded-lg bg-surface-dark border border-white/5 overflow-hidden mb-1.5 group-hover:border-primary/50 transition-colors">
                      <Image src={item.images[0]} alt={item.name} fill sizes="96px" className="object-cover" />
                      <span className="absolute top-1 left-1 text-[7px] px-1 py-0.5 bg-primary text-black font-bold rounded-full uppercase">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[10px] font-medium text-white truncate">{item.name}</p>
                    <p className="text-[9px] text-primary font-bold">{formatPrice(item.price)}</p>
                  </Link>
                ))}
              </div>

              {/* Voir plus button */}
              <Link
                href="/produits"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg text-xs font-medium transition-all"
              >
                Voir plus de produits
                <span className="material-icons text-sm">arrow_forward</span>
              </Link>
            </div>
          )}
        </main>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-3 z-30 bg-background-dark/95 backdrop-blur-xl border-t border-white/5 pb-safe">
          <div className="flex gap-2 items-center">
            {/* Quantity Selector */}
            <div className="flex items-center bg-surface-dark rounded-full border border-white/10 h-10 px-1 shrink-0">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-full flex items-center justify-center text-gray-400 hover:text-white"
              >
                <span className="material-icons text-sm">remove</span>
              </button>
              <span className="w-6 text-center text-xs font-medium text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-full flex items-center justify-center text-gray-400 hover:text-white"
              >
                <span className="material-icons text-sm">add</span>
              </button>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              whileTap={{ scale: product.inStock ? 0.95 : 1 }}
              animate={justAdded ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`flex-1 h-10 font-bold text-xs rounded-full flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                justAdded
                  ? "bg-green-500 text-white"
                  : "bg-primary hover:bg-primary-light text-black"
              }`}
            >
              {justAdded && <span className="material-icons text-sm">check</span>}
              <span>{justAdded ? "Ajouté" : product.inStock ? "Ajouter" : "Rupture"}</span>
            </motion.button>

            {/* Buy Now Button */}
            <motion.button
              onClick={handleBuyNow}
              disabled={!product.inStock}
              whileTap={{ scale: product.inStock ? 0.95 : 1 }}
              className="flex-1 h-10 font-bold text-xs rounded-full bg-primary hover:bg-primary-light text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <span className="material-icons text-sm">bolt</span>
              <span>Acheter</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* DESKTOP VERSION */}
      <div className="hidden lg:block min-h-screen pt-4 text-[0.85rem]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-6 relative">
            {/* Left Column: 50% - Images */}
            <div className="w-1/2 flex flex-col gap-3 pb-6">
              {/* Hero Image with Thumbnails */}
              <div className="flex gap-3">
                {/* Thumbnails Column */}
                {product.images.length > 1 && (
                  <div className="flex flex-col gap-2.5 w-20">
                    {/* Show first N-1 thumbnails */}
                    {visibleThumbnails.map((image, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden bg-surface-dark transition-all ${
                          idx === selectedImageIndex
                            ? "border-2 border-primary"
                            : "border border-white/10 hover:border-white/30"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} thumbnail ${idx + 1}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </button>
                    ))}

                    {/* Last thumbnail with +N indicator if more images */}
                    {hasMoreImages ? (
                      <button
                        onClick={() => openLightbox(MAX_VISIBLE_THUMBNAILS - 1)}
                        className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface-dark transition-all border border-white/10 hover:border-primary/50 group"
                      >
                        <Image
                          src={product.images[MAX_VISIBLE_THUMBNAILS - 1]}
                          alt={`${product.name} thumbnail ${MAX_VISIBLE_THUMBNAILS}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                          <span className="text-white font-bold text-lg">+{remainingImagesCount}</span>
                        </div>
                      </button>
                    ) : (
                      product.images[MAX_VISIBLE_THUMBNAILS - 1] && (
                        <button
                          onClick={() => setSelectedImageIndex(MAX_VISIBLE_THUMBNAILS - 1)}
                          className={`relative w-20 h-20 rounded-lg overflow-hidden bg-surface-dark transition-all ${
                            MAX_VISIBLE_THUMBNAILS - 1 === selectedImageIndex
                              ? "border-2 border-primary"
                              : "border border-white/10 hover:border-white/30"
                          }`}
                        >
                          <Image
                            src={product.images[MAX_VISIBLE_THUMBNAILS - 1]}
                            alt={`${product.name} thumbnail ${MAX_VISIBLE_THUMBNAILS}`}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </button>
                      )
                    )}
                  </div>
                )}

                {/* Main Hero Image */}
                <div className="group relative flex-1 rounded-lg overflow-hidden bg-surface-dark border border-white/5 shadow-2xl">
                  <Image
                    src={product.images[selectedImageIndex]}
                    alt={product.name}
                    width={800}
                    height={800}
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-dark/60 via-transparent to-transparent"></div>
                  {product.featured && (
                    <span className="absolute bottom-6 left-6 px-4 py-1.5 bg-primary text-black text-xs font-bold uppercase tracking-widest rounded-full">
                      Meilleure Vente
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: 50% - Sticky Product Info */}
            <div className="w-1/2 relative">
              <div className="sticky top-16 pb-6 h-fit">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="flex mb-3 text-[10px] text-gray-400">
                  <ol className="inline-flex items-center space-x-1">
                    <li className="inline-flex items-center">
                      <Link href="/" className="hover:text-primary transition-colors">
                        Accueil
                      </Link>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <span className="material-icons text-gray-600 text-xs mx-1">chevron_right</span>
                        <Link href="/produits" className="hover:text-primary transition-colors">
                          Produits
                        </Link>
                      </div>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <span className="material-icons text-gray-600 text-xs mx-1">chevron_right</span>
                        <Link href={`/produits?category=${product.category}`} className="text-gray-400 hover:text-primary transition-colors">
                          {categoryLabels[product.category]}
                        </Link>
                      </div>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <span className="material-icons text-gray-600 text-xs mx-1">chevron_right</span>
                        <span className="text-primary font-medium">{product.name}</span>
                      </div>
                    </li>
                  </ol>
                </nav>

                {/* Title */}
                <h1 className="text-2xl xl:text-3xl font-bold uppercase tracking-tight text-white mb-2 leading-tight">
                  {product.name}
                </h1>

                {/* Price & Reviews */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl font-medium text-white">{formatPrice(product.price)}</span>
                  {stats && (
                    <div className="flex items-center gap-0.5">
                      <div className="flex text-primary">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="material-icons text-xs">
                            {i < Math.floor(stats.averageRating) ? "star" :
                             i < stats.averageRating ? "star_half" : "star_border"}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400 ml-1">
                        ({stats.totalReviews} Avis)
                      </span>
                      <a
                        href="#reviews"
                        className="text-[10px] text-primary hover:text-primary-light transition-colors ml-1"
                      >
                        (regarder les avis)
                      </a>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-400 text-xs leading-relaxed mb-3 font-light">
                  {product.description}
                </p>

                {/* Stock Status */}
                {product.inStock && (
                  <div className="flex items-center gap-1.5 mb-3 p-1.5 rounded-lg bg-surface-dark border border-white/5 w-fit">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                    </span>
                    <span className="text-[10px] font-medium text-primary">En stock - Livraison 48h</span>
                  </div>
                )}

                <hr className="border-white/10 mb-3" />

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {/* Quantity */}
                    <div className="h-11 md:h-9 w-28 md:w-20 flex items-center justify-between px-2 bg-surface-dark rounded-full border border-white/10">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="text-gray-400 hover:text-white text-sm w-11 md:w-auto h-full flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="font-bold text-sm">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="text-gray-400 hover:text-white text-sm w-11 md:w-auto h-full flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>

                    {/* Add to Cart */}
                    <button
                      onClick={handleAddToCart}
                      disabled={!product.inStock}
                      className="flex-1 h-9 bg-primary hover:bg-primary-light text-black font-bold text-xs uppercase tracking-wide rounded-full flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>{product.inStock ? "Ajouter" : "Rupture de stock"}</span>
                      {product.inStock && <span className="material-icons text-sm">shopping_cart</span>}
                    </button>

                    {/* Buy Now Button */}
                    <motion.button
                      onClick={handleBuyNow}
                      disabled={!product.inStock}
                      whileTap={{ scale: product.inStock ? 0.95 : 1 }}
                      className="flex-1 h-9 bg-primary hover:bg-primary-light text-black font-bold text-xs uppercase tracking-wide rounded-full flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-icons text-sm">bolt</span>
                      <span>Acheter</span>
                    </motion.button>
                  </div>

                  {/* Secondary Actions (favorites flow hidden) */}
                  <div className="flex justify-center gap-4 pt-0.5">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
                    >
                      <span className="material-icons text-sm" aria-hidden="true">share</span>
                      Partager
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section - Collapsible & Compact */}
          <section id="reviews" className="mt-4 mb-4">
            {/* Header with Toggle and Write Review Button */}
            <div className="flex gap-2 mb-2">
              {/* Toggle Button - Thinner */}
              <button
                onClick={() => setReviewsExpanded(!reviewsExpanded)}
                className="flex-1 px-2.5 py-1.5 bg-background-card hover:bg-background-card/80 rounded-lg border border-white/10 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-1.5">
                  <h2 className="text-[10px] font-light text-white">Avis</h2>
                  <span className="text-[9px] text-primary">({sortedReviews.length})</span>
                  {stats && (
                    <div className="flex items-center gap-0.5">
                      <div className="flex text-primary">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="material-icons text-[9px]">
                            {i < Math.floor(stats.averageRating) ? "star" :
                             i < stats.averageRating ? "star_half" : "star_border"}
                          </span>
                        ))}
                      </div>
                      <span className="text-[9px] text-gray-400 ml-0.5">{stats.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <span className={`material-icons text-primary text-xs transition-transform ${reviewsExpanded ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {/* Write Review Button */}
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="px-3 py-1.5 bg-primary hover:bg-primary-light text-black text-[10px] font-medium rounded-lg transition-all flex items-center gap-1"
              >
                <span className="material-icons text-xs">edit</span>
                <span className="hidden sm:inline">Écrire un avis</span>
                <span className="sm:hidden">Avis</span>
              </button>
            </div>

            {/* Reviews Content */}
            {sortedReviews.length > 0 && reviewsExpanded && (
              <div className="mt-2 p-3 bg-background-card rounded-lg border border-white/10">
                  {/* Sort Dropdown */}
                  <div className="flex justify-end mb-2">
                    <select
                      value={reviewSort}
                      onChange={(e) => setReviewSort(e.target.value as 'relevance' | 'recent')}
                      className="px-2.5 py-1 bg-background-secondary border border-white/10 rounded-lg text-xs text-white focus:border-primary focus:outline-none"
                    >
                      <option value="relevance">Par pertinence</option>
                      <option value="recent">Plus récent</option>
                    </select>
                  </div>

                  {/* Reviews List - 2 Column Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {sortedReviews.slice(0, reviewsToShow).map((review) => (
                      <div key={review.id} className="p-2.5 bg-background-secondary/30 rounded-lg border border-white/5 flex gap-2">
                        {/* Review Content - Left Side */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="flex text-primary">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className="material-icons text-xs">
                                    {i < review.rating ? "star" : "star_border"}
                                  </span>
                                ))}
                              </div>
                              {review.verifiedPurchase && (
                                <span className="text-[9px] text-primary bg-primary/10 px-1 py-0.5 rounded-full">
                                  ✓
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-gray-500">
                              {new Date(review.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>

                          <p className="text-xs font-medium text-white mb-1">{review.authorName}</p>
                          <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">{review.comment}</p>
                        </div>

                        {/* Review Photos - Right Side */}
                        {review.photos && review.photos.length > 0 && (
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            {review.photos.slice(0, 2).map((photo, idx) => (
                              <div
                                key={idx}
                                onClick={() => openReviewImageLightbox(review.photos!, idx)}
                                className="w-14 h-14 rounded-md overflow-hidden border border-white/10 hover:border-primary/50 transition-colors cursor-pointer"
                              >
                                <img
                                  src={photo}
                                  alt={`Photo ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {review.photos.length > 2 && (
                              <div
                                onClick={() => openReviewImageLightbox(review.photos!, 2)}
                                className="w-14 h-8 rounded-md bg-background-dark border border-white/10 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                              >
                                <span className="text-[9px] text-gray-400">+{review.photos.length - 2}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Show More/Less Buttons - Mobile Optimized */}
                  <div className="mt-3 text-center flex flex-col sm:flex-row items-center justify-center gap-2">
                    {reviewsToShow < sortedReviews.length && (
                      <button
                        onClick={() => setReviewsToShow(prev => prev + 4)}
                        className="w-full sm:w-auto px-4 py-2.5 sm:px-3 sm:py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-medium rounded-full text-sm sm:text-xs transition-all"
                      >
                        Voir plus ({sortedReviews.length - reviewsToShow})
                      </button>
                    )}
                    {reviewsToShow > 4 && (
                      <button
                        onClick={() => setReviewsToShow(4)}
                        className="w-full sm:w-auto px-4 py-2.5 sm:px-3 sm:py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 font-medium rounded-full text-sm sm:text-xs transition-all"
                      >
                        Voir moins
                      </button>
                    )}
                  </div>
                </div>
              )}
          </section>

          {/* Related Products - Same Category */}
          {relatedProducts.length > 0 && (
            <section className="border-t border-white/5 bg-surface-dark/20 py-6 -mx-4 px-4">
              <div className="max-w-[1920px] mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold uppercase tracking-tight text-white">
                    Produits Similaires
                  </h2>
                  <Link
                    href={`/produits?categorie=${product.category}`}
                    className="hidden sm:flex items-center gap-1 text-primary hover:text-white transition-colors text-xs group"
                  >
                    Voir plus
                    <span className="material-icons text-sm group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </Link>
                </div>
                <div className="grid grid-cols-6 gap-3">
                  {relatedProducts.map((item) => (
                    <Link
                      key={item.id}
                      href={`/produits/${item.slug}`}
                      className="group cursor-pointer"
                    >
                      <div className="relative aspect-square rounded-lg bg-background-dark mb-1.5 overflow-hidden border border-white/5 hover:border-primary/30 transition-colors">
                        <Image
                          src={item.images[0]}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 16vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <h3 className="text-xs font-bold text-white mb-0.5 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-primary font-medium text-xs">{formatPrice(item.price)}</p>
                    </Link>
                  ))}
                </div>

                {/* Mobile: Full-width button */}
                <Link
                  href={`/produits?categorie=${product.category}`}
                  className="sm:hidden mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-medium rounded-full text-sm transition-all"
                >
                  Voir plus de produits
                  <span className="material-icons text-sm">arrow_forward</span>
                </Link>
              </div>
            </section>
          )}

          {/* Complementary Products - Complete Your Purchase */}
          {complementaryProducts.length > 0 && (
            <section className="border-t border-white/5 bg-surface-dark/20 py-6 -mx-4 px-4">
              <div className="max-w-[1920px] mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-base font-bold uppercase tracking-tight text-white">
                      Complétez votre achat
                    </h2>
                    <p className="text-[10px] text-gray-400 mt-0.5">Fréquemment achetés ensemble</p>
                  </div>
                  <Link
                    href="/produits"
                    className="hidden sm:flex items-center gap-1 text-primary hover:text-white transition-colors text-xs group"
                  >
                    Voir plus
                    <span className="material-icons text-sm group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </Link>
                </div>
                <div className="grid grid-cols-6 gap-3">
                  {complementaryProducts.map((item) => (
                    <Link
                      key={item.id}
                      href={`/produits/${item.slug}`}
                      className="group cursor-pointer"
                    >
                      <div className="relative aspect-square rounded-lg bg-background-dark mb-1.5 overflow-hidden border border-white/5 hover:border-primary/30 transition-colors">
                        <Image
                          src={item.images[0]}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 16vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Category badge */}
                        <span className="absolute top-1.5 left-1.5 text-[8px] px-1.5 py-0.5 bg-primary text-black font-bold rounded-full uppercase">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white mb-0.5 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-primary font-medium text-xs">{formatPrice(item.price)}</p>
                    </Link>
                  ))}
                </div>

                {/* Mobile: Full-width button */}
                <Link
                  href="/produits"
                  className="sm:hidden mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-medium rounded-full text-sm transition-all"
                >
                  Voir plus de produits
                  <span className="material-icons text-sm">arrow_forward</span>
                </Link>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <span className="material-icons">close</span>
          </button>

          {/* Previous Button */}
          {product.images.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            >
              <span className="material-icons">chevron_left</span>
            </button>
          )}

          {/* Next Button */}
          {product.images.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            >
              <span className="material-icons">chevron_right</span>
            </button>
          )}

          {/* Main Image */}
          <div className="max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center p-8">
            <img
              src={product.images[lightboxImageIndex]}
              alt={`${product.name} - Image ${lightboxImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium">
            {lightboxImageIndex + 1} / {product.images.length}
          </div>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-4xl overflow-x-auto px-4 pb-2 no-scrollbar">
            {product.images.map((image, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxImageIndex(idx)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                  idx === lightboxImageIndex
                    ? "border-2 border-primary"
                    : "border border-white/30 opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Click outside to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={closeLightbox}
          />
        </div>
      )}

      {/* Review Image Lightbox Modal */}
      {reviewImageLightbox.isOpen && (
        <div className="fixed inset-0 z-[101] bg-black/95 backdrop-blur-sm flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeReviewImageLightbox}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <span className="material-icons">close</span>
          </button>

          {/* Previous Button */}
          {reviewImageLightbox.images.length > 1 && (
            <button
              onClick={prevReviewImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            >
              <span className="material-icons">chevron_left</span>
            </button>
          )}

          {/* Next Button */}
          {reviewImageLightbox.images.length > 1 && (
            <button
              onClick={nextReviewImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            >
              <span className="material-icons">chevron_right</span>
            </button>
          )}

          {/* Main Image */}
          <div className="max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center p-8">
            <img
              src={reviewImageLightbox.images[reviewImageLightbox.currentIndex]}
              alt={`Review photo ${reviewImageLightbox.currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium">
            {reviewImageLightbox.currentIndex + 1} / {reviewImageLightbox.images.length}
          </div>

          {/* Thumbnail Strip */}
          {reviewImageLightbox.images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-4xl overflow-x-auto px-4 pb-2 no-scrollbar">
              {reviewImageLightbox.images.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setReviewImageLightbox(prev => ({ ...prev, currentIndex: idx }))}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                    idx === reviewImageLightbox.currentIndex
                      ? "border-2 border-primary"
                      : "border border-white/30 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Click outside to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={closeReviewImageLightbox}
          />
        </div>
      )}

      {/* Toast notification for added to cart - Desktop only */}
      {showAddedToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="hidden md:flex fixed bottom-4 right-4 glass-card backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-lg z-[9999] max-w-sm items-center gap-2"
        >
          <span className="material-icons text-primary text-lg">check_circle</span>
          <span>Produit ajouté au panier</span>
        </motion.div>
      )}

      {/* Review Submit Modal */}
      <ReviewSubmitModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        productId={product.id}
        productName={product.name}
      />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
