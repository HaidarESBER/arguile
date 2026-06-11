import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { categoryLabels } from '@/types/blog';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Découvrez nos guides, conseils et articles sur la chicha. Le blog Nuage vous accompagne dans votre expérience hookah.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog | Nuage',
    description:
      'Découvrez nos guides, conseils et articles sur la chicha. Le blog Nuage vous accompagne dans votre expérience hookah.',
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      {/* Hero header */}
      <section className="bg-primary text-background py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-accent text-sm font-medium uppercase tracking-[0.2em] mb-4">
            Journal
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-background font-light mb-4">
            Le Blog Nuage
          </h1>
          <p className="text-background/60 text-lg md:text-xl max-w-lg font-light">
            Guides, conseils et culture chicha pour les passionnés
          </p>
        </div>
      </section>

      {posts.length === 0 ? (
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-muted text-lg">Aucun article pour le moment.</p>
            <p className="text-muted mt-2">
              Revenez bientôt pour découvrir nos guides et conseils.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* Featured article — full-width editorial card */}
          {featured && (
            <section className="py-12 md:py-16 border-b border-background-secondary">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group block"
                >
                  <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-center">
                    {/* Left: decorative accent block */}
                    <div className="md:col-span-2 relative">
                      <div className="aspect-[4/3] bg-gradient-to-br from-accent/10 via-accent/5 to-transparent rounded-lg flex items-center justify-center overflow-hidden">
                        <div className="text-center p-8">
                          <span className="block font-heading text-7xl md:text-8xl text-accent/20 leading-none mb-2">
                            {featured.title.charAt(0)}
                          </span>
                          <span className="text-xs uppercase tracking-[0.25em] text-accent/60">
                            {categoryLabels[featured.category]}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: content */}
                    <div className="md:col-span-3">
                      <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-accent mb-4">
                        À la une
                      </span>
                      <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-primary group-hover:text-accent transition-colors duration-300 mb-5 leading-[1.15] font-light">
                        {featured.title}
                      </h2>
                      <p className="text-primary/60 text-lg leading-relaxed mb-6 max-w-xl">
                        {featured.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <time
                          dateTime={featured.date}
                          className="text-sm text-muted"
                        >
                          {new Date(featured.date).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                        <span className="w-1 h-1 rounded-full bg-muted/40" />
                        <span className="text-sm text-muted">
                          {featured.readingTime}
                        </span>
                      </div>
                      <div className="mt-8">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-accent group-hover:gap-3 transition-all duration-300">
                          Lire l&apos;article
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </section>
          )}

          {/* Remaining articles grid */}
          {rest.length > 0 && (
            <section className="py-12 md:py-16">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="font-heading text-2xl md:text-3xl text-primary mb-10 font-light">
                  Tous les articles
                </h2>
                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                  {rest.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group block"
                    >
                      <article className="h-full bg-background-card rounded-lg border border-background-secondary/50 hover:border-accent/20 hover:shadow-xl hover:shadow-accent/5 transition-all duration-500 overflow-hidden">
                        {/* Decorative top stripe */}
                        <div className="h-1 bg-gradient-to-r from-accent/40 via-accent/20 to-transparent" />

                        <div className="p-6 md:p-8">
                          {/* Category + reading time */}
                          <div className="flex items-center justify-between mb-5">
                            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
                              {categoryLabels[post.category]}
                            </span>
                            <span className="text-xs text-muted">
                              {post.readingTime}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="font-heading text-xl md:text-2xl text-primary group-hover:text-accent transition-colors duration-300 mb-3 leading-snug font-light">
                            {post.title}
                          </h3>

                          {/* Description */}
                          <p className="text-primary/50 text-sm leading-relaxed mb-6 line-clamp-3">
                            {post.description}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-5 border-t border-background-secondary/50">
                            <time
                              dateTime={post.date}
                              className="text-xs text-muted"
                            >
                              {new Date(post.date).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </time>
                            <span className="text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              Lire &rarr;
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
    </>
  );
}
