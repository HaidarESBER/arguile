import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "glass";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  // Dark text on gold: white on #d4af37 is ~1.9:1 contrast (fails WCAG);
  // the dark taupe reads at ~9:1 and matches the announcement bar.
  primary:
    "bg-primary text-background font-semibold hover:bg-primary-light transition-all",
  secondary:
    "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-primary/50 transition-all backdrop-blur-sm",
  glass:
    "bg-surface-glass backdrop-blur-md border border-white/5 text-white hover:bg-surface-hover hover:border-primary/30 transition-all",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-full",
  md: "px-6 py-3 text-base rounded-full",
  lg: "px-8 py-4 text-lg rounded-full font-bold",
};

/**
 * Button component with luxury dark mode styling
 *
 * Variants:
 * - primary: Wine red button with glow effect
 * - secondary: Transparent with subtle glass effect
 * - glass: Glassmorphic button with backdrop blur
 *
 * Sizes:
 * - sm: Small, compact padding
 * - md: Default medium size
 * - lg: Large, prominent with bold text
 *
 * @example
 * <Button variant="primary" size="md">Ajouter au panier</Button>
 * <Button variant="secondary">En savoir plus</Button>
 * <Button variant="glass">Aperçu rapide</Button>
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "primary", size = "md", children, ...props },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };
