"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/product";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { Product, formatPrice } from "@/types/product";
import { useLocale } from "@/contexts/LocaleContext";
import type { Locale } from "@/lib/i18n/config";

interface HomeClientProps {
  bestSellers: Product[];
  editorialPick: Product | null;
  ratingsMap?: Record<string, { averageRating: number; totalReviews: number }>;
  aggregateRating?: { average: number; count: number } | null;
}

const STRINGS = {
  fr: {
    heroTitle: "L'art de la détente.",
    heroSubtitle:
      "Chichas artisanales, charbon naturel, verre soufflé main. Tout ce qu'il faut pour ralentir.",
    discoverCollection: "Découvrir la collection",
    ourStory: "Notre histoire",
    reviewsCount: (count: number) => `${count} avis clients`,
    shipping24h: "Expédition sous 24h",
    bestSellers: "Meilleures ventes",
    fullCollection: "Toute la collection",
    categories: "Les catégories",
    seeAll: "Voir tout",
    signature: "Signature",
    hookahs: "Chichas",
    hookahsDesc:
      "Des pièces choisies une à une, du verre soufflé à l'inox brossé.",
    hookahsDescShort: "Des pièces choisies une à une",
    bowls: "Bols",
    bowlsDesc: "Céramiques artisanales pour une chauffe régulière.",
    bowlsDescShort: "Céramiques artisanales",
    charcoal: "Charbon",
    hoses: "Tuyaux",
    accessories: "Accessoires",
    foundersPick: "Le choix d'Ali & Haidar",
    pickRatedBefore: "La pièce que nous recommandons les yeux fermés — notée",
    pickRatedAfter: (count: number) => `par ${count} clients.`,
    pickFallback:
      "Notre coup de cœur de l'atelier — la pièce qu'on allume quand on reçoit.",
    discoverPrice: (price: string) => `Découvrir — ${price}`,
    quote:
      "« En Europe, la chicha était devenue une simple distraction, dépouillée de sa dimension culturelle. Nous avons créé Nuage pour lui rendre son rituel. »",
    quoteAuthor: "— Ali & Haidar, fondateurs",
    storyParagraph:
      "Chaque référence du catalogue est testée à l'atelier avant d'être proposée : aluminium aérospatial, cristal de Bohême, silicone de qualité médicale. Ce qui ne nous convainc pas n'entre pas en boutique.",
    authenticBrands: "Marques authentiques",
    expertAdvice: "Conseil par des connaisseurs",
    readOurStory: "Lire notre histoire",
    storyImageAlt:
      "Notre histoire - Deux frères libanais passionnés par la chicha",
  },
  en: {
    heroTitle: "The art of relaxation.",
    heroSubtitle:
      "Handcrafted hookahs, natural charcoal, hand-blown glass. Everything you need to slow down.",
    discoverCollection: "Discover the collection",
    ourStory: "Our story",
    reviewsCount: (count: number) => `${count} customer reviews`,
    shipping24h: "Ships within 24h",
    bestSellers: "Best sellers",
    fullCollection: "View the full collection",
    categories: "Categories",
    seeAll: "See all",
    signature: "Signature",
    hookahs: "Hookahs",
    hookahsDesc:
      "Pieces chosen one by one, from hand-blown glass to brushed stainless steel.",
    hookahsDescShort: "Pieces chosen one by one",
    bowls: "Bowls",
    bowlsDesc: "Handcrafted ceramics for even, steady heat.",
    bowlsDescShort: "Handcrafted ceramics",
    charcoal: "Charcoal",
    hoses: "Hoses",
    accessories: "Accessories",
    foundersPick: "Ali & Haidar's pick",
    pickRatedBefore: "The piece we recommend without hesitation — rated",
    pickRatedAfter: (count: number) => `by ${count} customers.`,
    pickFallback:
      "Our workshop favorite — the piece we light when friends come over.",
    discoverPrice: (price: string) => `Discover — ${price}`,
    quote:
      "“In Europe, hookah had become mere entertainment, stripped of its cultural depth. We created Nuage to give it back its ritual.”",
    quoteAuthor: "— Ali & Haidar, founders",
    storyParagraph:
      "Every product in the catalog is tested in our workshop before it goes on sale: aerospace-grade aluminum, Bohemian crystal, medical-grade silicone. If it doesn't convince us, it doesn't make it into the shop.",
    authenticBrands: "Authentic brands",
    expertAdvice: "Advice from connoisseurs",
    readOurStory: "Read our story",
    storyImageAlt:
      "Our story - Two Lebanese brothers passionate about hookah",
  },
} as const;

/** 4.8 -> "4,8" (fr) / "4.8" (en) */
function localeDecimal(n: number, locale: Locale): string {
  return n.toLocaleString(locale === "en" ? "en-US" : "fr-FR", {
    maximumFractionDigits: 1,
  });
}

export function HomeClient({
  bestSellers,
  editorialPick,
  ratingsMap = {},
  aggregateRating = null,
}: HomeClientProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = STRINGS[locale];

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
              {t.heroTitle}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-text-muted mb-7 sm:mb-8 max-w-xl mx-auto leading-relaxed">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-6">
              <Link
                href="/produits"
                className="px-8 py-3 bg-primary text-background font-semibold rounded-full hover:bg-primary-light transition-colors text-sm sm:text-base"
              >
                {t.discoverCollection}
              </Link>
              <Link
                href="/about"
                className="text-text-muted hover:text-primary transition-colors text-sm sm:text-base underline underline-offset-4 decoration-primary/40"
              >
                {t.ourStory}
              </Link>
            </div>

            {/* Proof line — real numbers only. Without enough reviews we show
                nothing: the announcement bar already carries shipping/returns. */}
            {aggregateRating && (
              <p className="text-xs sm:text-sm text-text-muted">
                <span className="text-primary" aria-hidden="true">★</span>{" "}
                {localeDecimal(aggregateRating.average, locale)}/5
                <span aria-hidden="true" className="mx-2 opacity-40">·</span>
                {t.reviewsCount(aggregateRating.count)}
                <span aria-hidden="true" className="mx-2 opacity-40">·</span>
                {t.shipping24h}
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
                  {t.bestSellers}
                </h2>
                <Link
                  href="/produits"
                  className="text-primary hover:text-text transition-colors text-sm whitespace-nowrap underline underline-offset-4 decoration-primary/40"
                >
                  {t.fullCollection}
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
              {t.categories}
            </h2>
            <Link
              href="/produits"
              className="text-primary hover:text-text transition-colors text-sm underline underline-offset-4 decoration-primary/40"
            >
              {t.seeAll}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 h-auto md:h-[480px]">
            {/* Large Item: Chichas */}
            <Link
              href="/produits/chichas"
              className="col-span-1 md:col-span-2 md:row-span-2 relative group rounded-lg overflow-hidden cursor-pointer"
            >
              <Image
                src="/chicha.jpg"
                alt={t.hookahs}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-5 z-10">
                <span className="text-primary text-xs font-semibold mb-1">{t.signature}</span>
                <h3 className="text-2xl font-bold text-white mb-1">{t.hookahs}</h3>
                <p className="text-gray-300 text-xs max-w-xs opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  {t.hookahsDesc}
                </p>
              </div>
            </Link>

            {/* Medium Item: Bowls */}
            <Link
              href="/produits/bols"
              className="col-span-1 md:col-span-2 md:row-span-1 relative group rounded-lg overflow-hidden cursor-pointer"
            >
              <Image
                src="/bowl.jpg"
                alt={t.bowls}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
                <h3 className="text-xl font-bold text-white">{t.bowls}</h3>
                <p className="text-gray-300 text-xs mt-0.5">{t.bowlsDesc}</p>
              </div>
            </Link>

            {/* Small Item: Coals */}
            <Link
              href="/produits/charbons"
              className="col-span-1 md:col-span-1 md:row-span-1 relative group rounded-lg overflow-hidden cursor-pointer"
            >
              <Image
                src="/coal.webp"
                alt={t.charcoal}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
                <h3 className="text-lg font-bold text-white">{t.charcoal}</h3>
              </div>
            </Link>

            {/* Small Item: Hoses */}
            <Link
              href="/produits/tuyaux"
              className="col-span-1 md:col-span-1 md:row-span-1 relative group rounded-lg overflow-hidden cursor-pointer"
            >
              <Image
                src="/hose.webp"
                alt={t.hoses}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
                <h3 className="text-lg font-bold text-white">{t.hoses}</h3>
              </div>
            </Link>
          </div>
        </section>

        {/* ====================== CATÉGORIES (mobile grid) ====================== */}
        <section className="md:hidden py-6 px-4">
          <div className="mb-4">
            <h2 className="font-display text-2xl font-medium tracking-tight">{t.categories}</h2>
          </div>

          <div className="grid grid-cols-2 gap-1.5 auto-rows-[85px]">
            {/* Large Item: Chichas - Spans 2 columns and 2 rows */}
            <Link
              href="/produits/chichas"
              className="col-span-2 row-span-2 relative group rounded-lg overflow-hidden cursor-pointer active:scale-[0.98] transition-all shadow-lg"
            >
              <Image
                src="/chicha.jpg"
                alt={t.hookahs}
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-500 group-active:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-3 z-10">
                <span className="text-primary text-xs font-semibold mb-0.5">{t.signature}</span>
                <h3 className="text-lg font-bold text-white mb-0.5">{t.hookahs}</h3>
                <p className="text-gray-300 text-xs leading-tight">
                  {t.hookahsDescShort}
                </p>
              </div>
            </Link>

            {/* Medium Item: Bowls - Spans 2 columns, 1 row */}
            <Link
              href="/produits/bols"
              className="col-span-2 row-span-1 relative group rounded-lg overflow-hidden cursor-pointer active:scale-[0.98] transition-all shadow-lg"
            >
              <Image
                src="/bowl.jpg"
                alt={t.bowls}
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-500 group-active:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-2.5 z-10">
                <h3 className="text-sm font-bold text-white mb-0.5">{t.bowls}</h3>
                <p className="text-gray-300 text-xs">{t.bowlsDescShort}</p>
              </div>
            </Link>

            {/* Small Item: Charbon */}
            <Link
              href="/produits/charbons"
              className="col-span-1 row-span-1 relative group rounded-lg overflow-hidden cursor-pointer active:scale-[0.98] transition-all shadow-lg"
            >
              <Image
                src="/coal.webp"
                alt={t.charcoal}
                fill
                sizes="50vw"
                className="object-cover transition-transform duration-500 group-active:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-2.5 z-10">
                <h3 className="text-sm font-bold text-white">{t.charcoal}</h3>
              </div>
            </Link>

            {/* Small Item: Accessories */}
            <Link
              href="/produits/accessoires"
              className="col-span-1 row-span-1 relative group rounded-lg overflow-hidden cursor-pointer active:scale-[0.98] transition-all shadow-lg"
            >
              <Image
                src="/accessories.jpg"
                alt={t.accessories}
                fill
                sizes="50vw"
                className="object-cover transition-transform duration-500 group-active:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-2.5 z-10">
                <h3 className="text-sm font-bold text-white">{t.accessories}</h3>
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
                    {t.foundersPick}
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl font-medium tracking-tight mb-4">
                    {editorialPick.name}
                  </h2>
                  <p className="text-text-muted text-sm sm:text-base leading-relaxed mb-6">
                    {pickStats && pickStats.totalReviews >= 3 ? (
                      <>
                        {t.pickRatedBefore}{" "}
                        <span className="text-text">
                          {localeDecimal(pickStats.averageRating, locale)}/5
                        </span>{" "}
                        {t.pickRatedAfter(pickStats.totalReviews)}
                      </>
                    ) : (
                      <>{t.pickFallback}</>
                    )}
                  </p>
                  <div className="flex items-center gap-5">
                    <Link
                      href={`/produits/${editorialPick.slug}`}
                      className="px-6 py-2.5 bg-primary text-background font-semibold rounded-full hover:bg-primary-light transition-colors text-sm"
                    >
                      {t.discoverPrice(formatPrice(editorialPick.price))}
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
                  {t.quote}
                </p>
                <cite className="not-italic text-primary text-sm font-semibold">
                  {t.quoteAuthor}
                </cite>
              </blockquote>

              <p className="text-text-muted text-sm sm:text-base leading-relaxed mb-8">
                {t.storyParagraph}
              </p>

              {/* Quiet reassurance row — no icon circles, no checklist */}
              <p className="text-text-muted text-sm mb-8">
                {t.shipping24h}
                <span aria-hidden="true" className="mx-2 text-primary/60">·</span>
                {t.authenticBrands}
                <span aria-hidden="true" className="mx-2 text-primary/60">·</span>
                {t.expertAdvice}
              </p>

              <Link
                href="/about"
                className="text-primary font-semibold hover:text-text transition-colors text-sm sm:text-base underline underline-offset-4 decoration-primary/40"
              >
                {t.readOurStory}
              </Link>
            </div>
            <div className="order-1 md:order-2 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-square">
                <Image
                  src="/history.jpeg"
                  alt={t.storyImageAlt}
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
