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
    ...components,
  };
}
