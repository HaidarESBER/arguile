"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/product";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { Product, formatPrice } from "@/types/product";

interface HomeClientProps {
  bestSellers: Product[];
  editorialPick: Product | null;
  ratingsMap?: Record<string, { averageRating: number; totalReviews: number }>;
  aggregateRating?: { average: number; count: number } | null;
}

/** 4.8 -> "4,8" (French decimal) */
function frenchDecimal(n: number): string {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
}

export function HomeClient({
  bestSellers,
  editorialPick,
  ratingsMap = {},
  aggregateRating = null,
}: HomeClientProps) {
  const router = useRouter();

  const handleRefresh = async () => {
    router.refresh();
  };

  const pickStats = editorialPick ? ratingsMap[editorialPick.id] : undefined;
  // First non-placeholder photo (the server guarantees at least one exists)
  const pickImage = editorialPick?.images.find(
    (img) => img && !img.toLowerCase().includes("placehold")
  ) ?? editorialPick?.images[0];

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="relative w-full overflow-x-hidden">
        {/* ============================== HERO ============================== */}
        <section className="relative h-[55vh] sm:h-[60vh] md:h-[68vh] w-full overflow-hidden flex items-center justify-center">
          {/* Background video — let the smoke be seen, then fade into the page */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/nuage-poster.jpg"
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            >
              <source src="/nuage.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background"></div>
          </div>

          {/* Hero content — one message, one action */}
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight text-text mb-4 sm:mb-5">
              L&apos;art de la détente.
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-text-muted mb-7 sm:mb-8 max-w-xl mx-auto leading-relaxed">
              Chichas artisanales, charbon naturel, verre soufflé main.
              Tout ce qu&apos;il faut pour ralentir.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-6">
              <Link
                href="/produits"
                className="px-8 py-3 bg-primary text-background font-semibold rounded-full hover:bg-primary-light transition-colors text-sm sm:text-base"
              >
                Découvrir la collection
              </Link>
              <Link
                href="/about"
                className="text-text-muted hover:text-primary transition-colors text-sm sm:text-base underline underline-offset-4 decoration-primary/40"
              >
                Notre histoire
              </Link>
            </div>

            {/* Proof line — real numbers only. Without enough reviews we show
                nothing: the announcement bar already carries shipping/returns. */}
            {aggregateRating && (
              <p className="text-xs sm:text-sm text-text-muted">
                <span className="text-primary" aria-hidden="true">★</span>{" "}
                {frenchDecimal(aggregateRating.average)}/5
                <span aria-hidden="true" className="mx-2 opacity-40">·</span>
                {aggregateRating.count} avis clients
                <span aria-hidden="true" className="mx-2 opacity-40">·</span>
                Expédition sous 24h
              </p>
            )}
          </div>
        </section>

        {/* ========================= MEILLEURES VENTES ========================= */}
        {bestSellers.length > 0 && (
          <section className="py-10 sm:py-14 relative w-full overflow-hidden">
            <div className="max-w-[1600px] w-full mx-auto">
              <div className="px-4 md:px-6 mb-5 sm:mb-7 flex items-end justify-between gap-3">
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight">
                  Meilleures ventes
                </h2>
                <Link
                  href="/produits"
                  className="text-primary hover:text-text transition-colors text-sm whitespace-nowrap underline underline-offset-4 decoration-primary/40"
                >
                  Toute la collection
                </Link>
              </div>

              <div className="overflow-x-auto hide-scrollbar px-4 md:px-6">
                <div className="flex gap-3 sm:gap-4 pb-2">
                  {bestSellers.map((product) => (
                    <div
                      key={product.id}
                      className="flex-shrink-0 w-[240px] sm:w-[280px] md:w-[300px]"
                    >
                      <ProductCard
                        product={product}
                        priority={false}
                        ratingStats={ratingsMap[product.id] || null}
                        disableAnimation={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ====================== CATÉGORIES (desktop bento) ====================== */}
        <section className="hidden md:block py-8 md:py-10 px-4 md:px-6 max-w-[1600px] w-full mx-auto">
          <div className="flex items-end justify-between mb-5 md:mb-6">
            <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight">
              Les catégories
            </h2>
            <Link
              href="/produits"
              className="text-primary hover:text-text transition-colors text-sm underline underline-offset-4 decoration-primary/40"
            >
              Voir tout
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 h-auto md:h-[480px]">
            {/* Large Item: Chichas */}
            <Link
              href="/produits?categorie=chicha"
              className="col-span-1 md:col-span-2 md:row-span-2 relative group rounded-lg overflow-hidden cursor-pointer"
            >
              <Image
                src="/chicha.jpg"
                alt="Chichas"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-5 z-10">
                <span className="text-primary text-xs font-semibold mb-1">Signature</span>
                <h3 className="text-2xl font-bold text-white mb-1">Chichas</h3>
                <p className="text-gray-300 text-xs max-w-xs opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  Des pièces choisies une à une, du verre soufflé à l&apos;inox brossé.
                </p>
              </div>
            </Link>

            {/* Medium Item: Bowls */}
            <Link
              href="/produits?categorie=bol"
              className="col-span-1 md:col-span-2 md:row-span-1 relative group rounded-lg overflow-hidden cursor-pointer"
            >
              <Image
                src="/bowl.jpg"
                alt="Bols"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
                <h3 className="text-xl font-bold text-white">Bols</h3>
                <p className="text-gray-300 text-xs mt-0.5">Céramiques artisanales pour une chauffe régulière.</p>
              </div>
            </Link>

            {/* Small Item: Coals */}
            <Link
              href="/produits?categorie=charbon"
              className="col-span-1 md:col-span-1 md:row-span-1 relative group rounded-lg overflow-hidden cursor-pointer"
            >
              <Image
                src="/coal.webp"
                alt="Charbon"
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
                <h3 className="text-lg font-bold text-white">Charbon</h3>
              </div>
            </Link>

            {/* Small Item: Hoses */}
            <Link
              href="/produits?categorie=tuyau"
              className="col-span-1 md:col-span-1 md:row-span-1 relative group rounded-lg overflow-hidden cursor-pointer"
            >
              <Image
                src="/hose.webp"
                alt="Tuyaux"
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
                <h3 className="text-lg font-bold text-white">Tuyaux</h3>
              </div>
            </Link>
          </div>
        </section>

        {/* ====================== CATÉGORIES (mobile grid) ====================== */}
        <section className="md:hidden py-6 px-4">
          <div className="mb-4">
            <h2 className="font-display text-2xl font-medium tracking-tight">Les catégories</h2>
          </div>

          <div className="grid grid-cols-2 gap-1.5 auto-rows-[85px]">
            {/* Large Item: Chichas - Spans 2 columns and 2 rows */}
            <Link
              href="/produits?categorie=chicha"
              className="col-span-2 row-span-2 relative group rounded-lg overflow-hidden cursor-pointer active:scale-[0.98] transition-all shadow-lg"
            >
              <Image
                src="/chicha.jpg"
                alt="Chichas"
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-500 group-active:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-3 z-10">
                <span className="text-primary text-xs font-semibold mb-0.5">Signature</span>
                <h3 className="text-lg font-bold text-white mb-0.5">Chichas</h3>
                <p className="text-gray-300 text-xs leading-tight">
                  Des pièces choisies une à une
                </p>
              </div>
            </Link>

            {/* Medium Item: Bowls - Spans 2 columns, 1 row */}
            <Link
              href="/produits?categorie=bol"
              className="col-span-2 row-span-1 relative group rounded-lg overflow-hidden cursor-pointer active:scale-[0.98] transition-all shadow-lg"
            >
              <Image
                src="/bowl.jpg"
                alt="Bols"
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-500 group-active:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-2.5 z-10">
                <h3 className="text-sm font-bold text-white mb-0.5">Bols</h3>
                <p className="text-gray-300 text-xs">Céramiques artisanales</p>
              </div>
            </Link>

            {/* Small Item: Charbon */}
            <Link
              href="/produits?categorie=charbon"
              className="col-span-1 row-span-1 relative group rounded-lg overflow-hidden cursor-pointer active:scale-[0.98] transition-all shadow-lg"
            >
              <Image
                src="/coal.webp"
                alt="Charbon"
                fill
                sizes="50vw"
                className="object-cover transition-transform duration-500 group-active:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-2.5 z-10">
                <h3 className="text-sm font-bold text-white">Charbon</h3>
              </div>
            </Link>

            {/* Small Item: Accessories */}
            <Link
              href="/produits?categorie=accessoire"
              className="col-span-1 row-span-1 relative group rounded-lg overflow-hidden cursor-pointer active:scale-[0.98] transition-all shadow-lg"
            >
              <Image
                src="/accessories.jpg"
                alt="Accessoires"
                fill
                sizes="50vw"
                className="object-cover transition-transform duration-500 group-active:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-2.5 z-10">
                <h3 className="text-sm font-bold text-white">Accessoires</h3>
              </div>
            </Link>
          </div>
        </section>

        {/* ======================= LE CHOIX DES FONDATEURS ======================= */}
        {editorialPick && (
          <section className="py-10 sm:py-14 px-4 md:px-6">
            <div className="max-w-[1200px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden border border-border-light bg-background-secondary">
                <Link
                  href={`/produits/${editorialPick.slug}`}
                  className="relative aspect-square md:aspect-auto md:min-h-[420px] group"
                >
                  <Image
                    src={pickImage || "/nuage-poster.jpg"}
                    alt={editorialPick.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </Link>
                <div className="flex flex-col justify-center p-6 sm:p-10 md:p-12">
                  <span className="text-primary text-xs font-semibold mb-3">
                    Le choix d&apos;Ali &amp; Haidar
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl font-medium tracking-tight mb-4">
                    {editorialPick.name}
                  </h2>
                  <p className="text-text-muted text-sm sm:text-base leading-relaxed mb-6">
                    {pickStats && pickStats.totalReviews >= 3 ? (
                      <>
                        La pièce que nous recommandons les yeux fermés — notée{" "}
                        <span className="text-text">
                          {frenchDecimal(pickStats.averageRating)}/5
                        </span>{" "}
                        par {pickStats.totalReviews} clients.
                      </>
                    ) : (
                      <>Notre coup de cœur de l&apos;atelier — la pièce qu&apos;on allume quand on reçoit.</>
                    )}
                  </p>
                  <div className="flex items-center gap-5">
                    <Link
                      href={`/produits/${editorialPick.slug}`}
                      className="px-6 py-2.5 bg-primary text-background font-semibold rounded-full hover:bg-primary-light transition-colors text-sm"
                    >
                      Découvrir — {formatPrice(editorialPick.price)}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============================ NOTRE HISTOIRE ============================ */}
        <section className="py-12 sm:py-16 px-4 md:px-6 relative overflow-hidden w-full">
          <div className="max-w-[1200px] w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">
            <div className="order-2 md:order-1">
              {/* The founders' words carry the section — large, serif, honest */}
              <blockquote className="mb-8">
                <p className="font-display italic text-2xl sm:text-3xl md:text-[2.1rem] leading-snug text-text mb-4">
                  «&nbsp;En Europe, la chicha était devenue une simple distraction,
                  dépouillée de sa dimension culturelle. Nous avons créé Nuage
                  pour lui rendre son rituel.&nbsp;»
                </p>
                <cite className="not-italic text-primary text-sm font-semibold">
                  — Ali &amp; Haidar, fondateurs
                </cite>
              </blockquote>

              <p className="text-text-muted text-sm sm:text-base leading-relaxed mb-8">
                Chaque référence du catalogue est testée à l&apos;atelier avant
                d&apos;être proposée&nbsp;: aluminium aérospatial, cristal de Bohême,
                silicone de qualité médicale. Ce qui ne nous convainc pas
                n&apos;entre pas en boutique.
              </p>

              {/* Quiet reassurance row — no icon circles, no checklist */}
              <p className="text-text-muted text-sm mb-8">
                Expédition sous 24h
                <span aria-hidden="true" className="mx-2 text-primary/60">·</span>
                Marques authentiques
                <span aria-hidden="true" className="mx-2 text-primary/60">·</span>
                Conseil par des connaisseurs
              </p>

              <Link
                href="/about"
                className="text-primary font-semibold hover:text-text transition-colors text-sm sm:text-base underline underline-offset-4 decoration-primary/40"
              >
                Lire notre histoire
              </Link>
            </div>
            <div className="order-1 md:order-2 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-square">
                <Image
                  src="/history.jpeg"
                  alt="Notre histoire - Deux frères libanais passionnés par la chicha"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </PullToRefresh>
  );
}
