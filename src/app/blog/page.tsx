import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/lib/blog';
import { categoryLabels } from '@/types/blog';
import { DEFAULT_OG_IMAGE } from '@/lib/seo';
import { getLocale } from '@/lib/i18n/server';

const STRINGS = {
  fr: {
    metaTitle: 'Le Journal',
    metaDescription:
      'Découvrez nos guides, conseils et articles sur la chicha. Le journal Nuage vous accompagne dans votre expérience.',
    ogTitle: 'Le Journal | Nuage',
    ogLocale: 'fr_FR',
    dateLocale: 'fr-FR',
    journal: 'Le Journal',
    heroTitle: 'Culture & conseils',
    heroSubtitle:
      'Guides, histoire et art de vivre autour de la chicha — pour les curieux comme pour les passionnés.',
    noPosts: 'Aucun article pour le moment.',
    noPostsHint: 'Revenez bientôt pour découvrir nos guides et conseils.',
    featured: 'À la une',
    readArticle: "Lire l'article",
    allPosts: 'Tous les articles',
    read: 'Lire →',
  },
  en: {
    metaTitle: 'The Journal',
    metaDescription:
      'Discover our hookah guides, tips and articles. The Nuage journal accompanies you throughout your experience.',
    ogTitle: 'The Journal | Nuage',
    ogLocale: 'en_US',
    dateLocale: 'en-US',
    journal: 'The Journal',
    heroTitle: 'Culture & tips',
    heroSubtitle:
      'Guides, history and the art of living around the hookah — for the curious and the passionate alike.',
    noPosts: 'No articles yet.',
    noPostsHint: 'Come back soon to discover our guides and tips.',
    featured: 'Featured',
    readArticle: 'Read the article',
    allPosts: 'All articles',
    read: 'Read →',
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = STRINGS[locale];

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: '/blog',
    },
    openGraph: {
      title: t.ogTitle,
      description: t.metaDescription,
      type: 'website',
      locale: t.ogLocale,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

function formatDate(date: string, dateLocale: string): string {
  return new Date(date).toLocaleDateString(dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogPage() {
  const locale = await getLocale();
  const t = STRINGS[locale];
  const posts = getAllPosts(locale);
  const [featured, ...rest] = posts;

  return (
    <main className="bg-background">
      {/* Hero header — dark, editorial, consistent with the rest of the site */}
      <section className="border-b border-border-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">
            {t.journal}
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-text mb-4">
            {t.heroTitle}
          </h1>
          <p className="text-text-muted text-base md:text-lg max-w-xl mx-auto">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      {posts.length === 0 ? (
        <section className="py-24 text-center">
          <p className="text-text-muted text-lg">{t.noPosts}</p>
          <p className="text-text-muted mt-2">
            {t.noPostsHint}
          </p>
        </section>
      ) : (
        <>
          {/* Featured article */}
          {featured && (
            <section className="py-12 md:py-16 border-b border-border-light">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href={`/blog/${featured.slug}`} className="group block">
                  <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    {/* Visual: cover image if present, else an editorial panel */}
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border-light">
                      {featured.image ? (
                        <Image
                          src={featured.image}
                          alt={featured.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-background-secondary flex flex-col items-center justify-center p-8 text-center">
                          <span className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-3">
                            {categoryLabels[featured.category][locale]}
                          </span>
                          <span className="font-display italic text-2xl md:text-3xl text-text-muted leading-snug">
                            Nuage
                          </span>
                          <span className="mt-4 block w-12 h-px bg-primary/40" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-4">
                        {t.featured}
                      </span>
                      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium text-text group-hover:text-primary transition-colors duration-300 mb-4 leading-[1.15]">
                        {featured.title}
                      </h2>
                      <p className="text-text-muted text-base md:text-lg leading-relaxed mb-6 max-w-xl">
                        {featured.description}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-text-muted">
                        <time dateTime={featured.date}>{formatDate(featured.date, t.dateLocale)}</time>
                        <span className="w-1 h-1 rounded-full bg-text-muted/40" />
                        <span>{featured.readingTime}</span>
                      </div>
                      <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all duration-300">
                        {t.readArticle}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </section>
          )}

          {/* Remaining articles */}
          {rest.length > 0 && (
            <section className="py-12 md:py-16">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="font-display text-2xl md:text-3xl font-medium text-text mb-8">
                  {t.allPosts}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="group block h-full">
                      <article className="h-full bg-background-secondary rounded-xl border border-border-light hover:border-primary/40 transition-colors duration-300 overflow-hidden flex flex-col">
                        {/* Cover image, or a slim gold rule when none */}
                        {post.image ? (
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <Image
                              src={post.image}
                              alt={post.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="h-1 bg-gradient-to-r from-primary/60 via-primary/25 to-transparent" />
                        )}

                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                              {categoryLabels[post.category][locale]}
                            </span>
                            <span className="text-xs text-text-muted">{post.readingTime}</span>
                          </div>

                          <h3 className="font-display text-xl md:text-2xl font-medium text-text group-hover:text-primary transition-colors duration-300 mb-2.5 leading-snug">
                            {post.title}
                          </h3>

                          <p className="text-text-muted text-sm leading-relaxed mb-6 line-clamp-3">
                            {post.description}
                          </p>

                          <div className="mt-auto flex items-center justify-between pt-4 border-t border-border-light">
                            <time dateTime={post.date} className="text-xs text-text-muted">
                              {formatDate(post.date, t.dateLocale)}
                            </time>
                            <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              {t.read}
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
