import type { MDXComponents } from 'mdx/types';
import Image, { ImageProps } from 'next/image';
import Link from 'next/link';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Optimize images with Next.js Image component
    img: (props) => (
      <Image
        width={800}
        height={450}
        style={{ width: '100%', height: 'auto' }}
        {...(props as ImageProps)}
        alt={props.alt || ''}
      />
    ),
    // Use Next.js Link for internal links
    a: (props) => {
      const href = props.href || '';
      if (href.startsWith('/')) {
        return <Link href={href} {...props}>{props.children}</Link>;
      }
      return <a {...props} target="_blank" rel="noopener noreferrer" />;
    },
    // Dark-theme table styling (Tailwind Typography's defaults assume a light
    // background and render with poor contrast on the dark site). Wrapped for
    // horizontal scroll on narrow screens.
    table: (props) => (
      <div className="my-8 overflow-x-auto rounded-xl border border-white/10">
        <table
          className="w-full border-collapse text-left text-sm"
          {...props}
        />
      </div>
    ),
    thead: (props) => (
      <thead className="bg-background-secondary" {...props} />
    ),
    th: (props) => (
      <th
        className="px-4 py-3 font-semibold text-primary border-b border-primary/30"
        {...props}
      />
    ),
    td: (props) => (
      <td
        className="px-4 py-3 text-text-muted border-b border-white/5 align-top"
        {...props}
      />
    ),
    tr: (props) => (
      <tr className="even:bg-white/[0.02]" {...props} />
    ),
    ...components,
  };
}
