import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug, getPostSlugs, hasTranslatedPost } from '@/lib/blog';
import { generateArticleSchema, safeJsonLd, DEFAULT_OG_IMAGE } from '@/lib/seo';
import { SocialShareButtons } from '@/components/social/SocialShareButtons';
import { categoryLabels, BlogPostMeta } from '@/types/blog';
import { getLocale } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/config';

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

const STRINGS = {
  fr: {
    notFound: 'Article non trouvé',
    breadcrumb: "Fil d'Ariane",
    by: 'Par',
    share: 'Partager cet article',
    related: 'À lire aussi',
    readArticle: "Lire l'article",
    backToBlog: 'Retour au blog',
    ogLocale: 'fr_FR',
    dateLocale: 'fr-FR',
  },
  en: {
    notFound: 'Article not found',
    breadcrumb: 'Breadcrumb',
    by: 'By',
    share: 'Share this article',
    related: 'Also worth reading',
    readArticle: 'Read the article',
    backToBlog: 'Back to the blog',
    ogLocale: 'en_US',
    dateLocale: 'en-US',
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const t = STRINGS[locale];
  const post = getPostBySlug(slug, locale);

  if (!post) {
    return { title: t.notFound };
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      locale: t.ogLocale,
      publishedTime: post.date,
      authors: [post.author],
      images: [
        post.image
          ? { url: post.image, width: 1200, height: 630, alt: post.title }
          : DEFAULT_OG_IMAGE,
      ],
    },
  };
}

function getRelatedPosts(currentSlug: string, locale: Locale): BlogPostMeta[] {
  return getAllPosts(locale)
    .filter((p) => p.slug !== currentSlug)
    .slice(0, 2);
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = STRINGS[locale];
  const post = getPostBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  const { default: Post } = hasTranslatedPost(slug, locale)
    ? await import(`@/content/blog/${locale}/${slug}.mdx`)
    : await import(`@/content/blog/${slug}.mdx`);

  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.description,
    date: post.date,
    author: post.author,
    slug: post.slug,
  });

  const related = getRelatedPosts(slug, locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleSchema) }}
      />

      {/* Article hero header — dark background like blog index */}
      <section className="bg-primary text-background py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8" aria-label={t.breadcrumb}>
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="text-background/50 hover:text-accent transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li aria-hidden="true" className="text-background/20">/</li>
              <li className="text-background/70 truncate max-w-[280px]">
                {post.title}
              </li>
            </ol>
          </nav>

          {/* Category */}
          <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-accent mb-5">
            {categoryLabels[post.category][locale]}
          </span>

          {/* Title */}
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-background font-light leading-[1.15] mb-6">
            {post.title}
          </h1>

          {/* Description as lead */}
          <p className="text-background/50 text-lg md:text-xl font-light leading-relaxed mb-8 max-w-2xl">
            {post.description}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-background/40">
            <span className="text-background/60">{t.by} {post.author}</span>
            <span className="w-1 h-1 rounded-full bg-background/20" />
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString(t.dateLocale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span className="w-1 h-1 rounded-full bg-background/20" />
            <span>{post.readingTime}</span>
          </div>
        </div>
      </section>

      {/* Article body */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:font-medium prose-headings:text-text prose-h2:text-3xl prose-h2:md:text-4xl prose-h2:mt-12 prose-h2:mb-5 prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-p:text-text-muted prose-p:leading-[1.8] prose-li:text-text-muted prose-li:leading-[1.8] prose-li:marker:text-primary prose-strong:text-text prose-strong:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-hr:border-white/10 prose-blockquote:border-l-primary prose-blockquote:text-text prose-ol:my-6 prose-ul:my-6">
            <Post />
          </article>

          {/* Social Share Buttons */}
          <div className="mt-12 pt-8 border-t border-background-secondary">
            <h3 className="font-heading text-lg text-primary mb-4 font-light">
              {t.share}
            </h3>
            <SocialShareButtons
              url={`/blog/${slug}`}
              title={post.title}
              description={post.description}
              variant="inline"
            />
          </div>
        </div>
      </section>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="py-12 md:py-16 bg-background-secondary/50 border-t border-background-secondary">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl md:text-3xl text-primary font-light mb-8">
              {t.related}
            </h2>
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {related.map((relPost) => (
                <Link
                  key={relPost.slug}
                  href={`/blog/${relPost.slug}`}
                  className="group block bg-background-card rounded-lg border border-background-secondary/50 hover:border-accent/20 hover:shadow-lg transition-all duration-500 overflow-hidden"
                >
                  <div className="h-0.5 bg-gradient-to-r from-accent/30 via-accent/10 to-transparent" />
                  <div className="p-6 md:p-8">
                    <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent mb-3 block">
                      {categoryLabels[relPost.category][locale]}
                    </span>
                    <h3 className="font-heading text-xl md:text-2xl text-primary group-hover:text-accent transition-colors duration-300 mb-3 leading-snug font-light">
                      {relPost.title}
                    </h3>
                    <p className="text-primary/50 text-sm leading-relaxed line-clamp-2 mb-4">
                      {relPost.description}
                    </p>
                    <span className="text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {t.readArticle} &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to blog */}
      <section className="py-10 border-t border-background-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-dark transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
            </svg>
            {t.backToBlog}
          </Link>
        </div>
      </section>
    </>
  );
}
