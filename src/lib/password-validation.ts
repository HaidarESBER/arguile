/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result with error message if invalid
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 12) {
    return { valid: false, error: "Le mot de passe doit contenir au moins 12 caractères" };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Le mot de passe doit contenir au moins une majuscule" };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Le mot de passe doit contenir au moins une minuscule" };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Le mot de passe doit contenir au moins un chiffre" };
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, error: "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)" };
  }

  // Check against common passwords
  const commonPasswords = [
    'password123!', 'password123', 'azerty123!', 'azerty123',
    '123456789!', 'motdepasse123', 'password1234!', 'admin123!'
  ];
  if (commonPasswords.some(p => p.toLowerCase() === password.toLowerCase())) {
    return { valid: false, error: "Ce mot de passe est trop commun. Veuillez en choisir un autre." };
  }

  return { valid: true };
}
