import { HTMLAttributes, forwardRef } from "react";

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
  as?: "div" | "section" | "article" | "main";
}

const sizeStyles: Record<ContainerSize, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

/**
 * Container component for consistent page layout
 *
 * Provides max-width constraint, centered content, and responsive padding.
 * Uses generous whitespace aligned with brand guidelines.
 *
 * Sizes:
 * - sm: 672px (max-w-2xl) - For narrow content like articles
 * - md: 896px (max-w-4xl) - For medium content
 * - lg: 1152px (max-w-6xl) - Default for most page content
 * - xl: 1280px (max-w-7xl) - For wider layouts
 * - full: No max-width constraint
 *
 * @example
 * <Container size="lg">
 *   <h1>Page content</h1>
 * </Container>
 *
 * <Container as="section" size="md">
 *   <article>...</article>
 * </Container>
 */
const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className = "", size = "lg", as: Component = "div", children, ...props }, ref) => {
    const baseStyles = "mx-auto w-full px-4 sm:px-6 lg:px-8";

    return (
      <Component
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = "Container";

export { Container, type ContainerProps, type ContainerSize };
