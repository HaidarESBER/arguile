type PasswordLocale = "fr" | "en";

const MESSAGES = {
  fr: {
    minLength: "Le mot de passe doit contenir au moins 12 caractères",
    uppercase: "Le mot de passe doit contenir au moins une majuscule",
    lowercase: "Le mot de passe doit contenir au moins une minuscule",
    digit: "Le mot de passe doit contenir au moins un chiffre",
    special: "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)",
    common: "Ce mot de passe est trop commun. Veuillez en choisir un autre.",
  },
  en: {
    minLength: "Password must be at least 12 characters long",
    uppercase: "Password must contain at least one uppercase letter",
    lowercase: "Password must contain at least one lowercase letter",
    digit: "Password must contain at least one digit",
    special: "Password must contain at least one special character (!@#$%^&*)",
    common: "This password is too common. Please choose another one.",
  },
} as const;

/**
 * Validate password strength
 * @param password - Password to validate
 * @param locale - Locale for the user-facing error message (defaults to "fr")
 * @returns Validation result with error message if invalid
 */
export function validatePassword(
  password: string,
  locale: PasswordLocale = "fr"
): { valid: boolean; error?: string } {
  const m = MESSAGES[locale];

  if (password.length < 12) {
    return { valid: false, error: m.minLength };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: m.uppercase };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: m.lowercase };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: m.digit };
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, error: m.special };
  }

  // Check against common passwords
  const commonPasswords = [
    'password123!', 'password123', 'azerty123!', 'azerty123',
    '123456789!', 'motdepasse123', 'password1234!', 'admin123!'
  ];
  if (commonPasswords.some(p => p.toLowerCase() === password.toLowerCase())) {
    return { valid: false, error: m.common };
  }

  return { valid: true };
}
