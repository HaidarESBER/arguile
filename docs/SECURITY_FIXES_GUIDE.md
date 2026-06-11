# Security Fixes Implementation Guide

This guide provides code examples to fix the CRITICAL vulnerabilities found in the security audit.

---

## 1. Create Authentication Middleware

Create `src/middleware.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
      // Redirect to login page
      return NextResponse.redirect(new URL('/compte?redirect=/admin', request.url));
    }

    try {
      const session = JSON.parse(sessionCookie.value);

      // TODO: Add admin role check when roles are implemented
      // For now, any authenticated user can access admin
      // if (!session.isAdmin) {
      //   return NextResponse.redirect(new URL('/', request.url));
      // }

    } catch (error) {
      // Invalid session, redirect to login
      return NextResponse.redirect(new URL('/compte', request.url));
    }
  }

  // Protect admin API routes
  if (pathname.startsWith('/api/update-order-tracking') ||
      pathname.startsWith('/api/send-order-email') ||
      pathname.startsWith('/api/send-shipping-email')) {

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      const session = JSON.parse(sessionCookie.value);
      // TODO: Check admin role
      // if (!session.isAdmin) {
      //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      // }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/update-order-tracking',
    '/api/send-order-email',
    '/api/send-shipping-email',
  ],
};
```

---

## 2. Add Admin Role to User Type

Update `src/types/user.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  isAdmin?: boolean; // ADD THIS
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin?: boolean; // ADD THIS
}
```

Update `src/lib/users.ts` to include `isAdmin` in sessions:

```typescript
// In registerUser function, return:
return {
  id: newUser.id,
  email: newUser.email,
  firstName: newUser.firstName,
  lastName: newUser.lastName,
  isAdmin: newUser.isAdmin || false, // ADD THIS
};

// In loginUser function, return:
return {
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  isAdmin: user.isAdmin || false, // ADD THIS
};

// In getUserById and getUserByEmail, also include isAdmin
```

---

## 3. Protect Order Query Endpoint

Update `src/app/api/orders/by-email/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getOrdersByEmail } from "@/lib/orders";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  // REQUIRE AUTHENTICATION
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('user_session');

  if (!sessionCookie) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  let session;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    return NextResponse.json(
      { error: "Invalid session" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  // Only allow users to query their own orders (or admins to query any)
  if (email.toLowerCase() !== session.email.toLowerCase() && !session.isAdmin) {
    return NextResponse.json(
      { error: "Forbidden: Can only access your own orders" },
      { status: 403 }
    );
  }

  try {
    const orders = await getOrdersByEmail(email);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders by email:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
```

---

## 4. Implement Rate Limiting

Install rate limiting package:

```bash
npm install @upstash/ratelimit @upstash/redis
```

Create `src/lib/rate-limit.ts`:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// For development/testing without Upstash, use in-memory store
// For production, use Upstash Redis
const isProduction = process.env.NODE_ENV === 'production';

// Simple in-memory rate limiter for development
class InMemoryRateLimiter {
  private store = new Map<string, { count: number; resetAt: number }>();

  async limit(identifier: string, limit: number, window: number) {
    const now = Date.now();
    const key = identifier;
    const data = this.store.get(key);

    if (!data || now > data.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + window });
      return { success: true, remaining: limit - 1 };
    }

    if (data.count >= limit) {
      return { success: false, remaining: 0 };
    }

    data.count++;
    return { success: true, remaining: limit - data.count };
  }
}

// Use Upstash in production, in-memory for dev
export const rateLimiter = isProduction && process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
    })
  : new InMemoryRateLimiter();

// Different rate limiters for different purposes
export const authRateLimiter = new InMemoryRateLimiter();
export const apiRateLimiter = new InMemoryRateLimiter();
```

Use in login endpoint (`src/app/api/auth/login/route.ts`):

```typescript
import { authRateLimiter } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  // Rate limit: 5 login attempts per minute per IP
  const { success, remaining } = await authRateLimiter.limit(
    `login:${ip}`,
    5,
    60000 // 1 minute
  );

  if (!success) {
    return NextResponse.json(
      { error: "Trop de tentatives de connexion. Veuillez réessayer dans une minute." },
      { status: 429 }
    );
  }

  // ... rest of login logic
}
```

---

## 5. Improve Password Validation

Update `src/lib/users.ts`:

```typescript
function validatePassword(password: string): { valid: boolean; error?: string } {
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
    return { valid: false, error: "Le mot de passe doit contenir au moins un caractère spécial" };
  }

  // Check against common passwords
  const commonPasswords = ['password123!', 'Password123!', 'Azerty123!'];
  if (commonPasswords.some(p => p.toLowerCase() === password.toLowerCase())) {
    return { valid: false, error: "Ce mot de passe est trop commun" };
  }

  return { valid: true };
}

export async function registerUser(data: RegisterData): Promise<UserSession> {
  const users = await readUsersFile();

  // Check if email already exists
  const existingUser = users.find(
    (u) => u.email.toLowerCase() === data.email.toLowerCase()
  );

  if (existingUser) {
    throw new Error("Un compte existe déjà avec cette adresse email");
  }

  // Validate password with new rules
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.error!);
  }

  // ... rest of function
}
```

---

## 6. Add Security Headers

Update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... existing config

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## 7. Add Session Helper Functions

Create `src/lib/session.ts`:

```typescript
import { cookies } from "next/headers";
import { UserSession } from "@/types/user";

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('user_session');

  if (!sessionCookie) {
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie.value) as UserSession;
    return session;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new Error("Authentication required");
  }

  return session;
}

export async function requireAdmin(): Promise<UserSession> {
  const session = await requireAuth();

  if (!session.isAdmin) {
    throw new Error("Admin access required");
  }

  return session;
}
```

Use in protected routes:

```typescript
import { requireAdmin } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(); // This will throw if not admin

    // Your protected logic here

  } catch (error) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "Admin access required") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    throw error;
  }
}
```

---

## 8. Create Admin User Script

Create `scripts/create-admin.ts`:

```typescript
import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";

async function createAdmin() {
  const dataFilePath = path.join(process.cwd(), "data", "users.json");

  const users = JSON.parse(await fs.readFile(dataFilePath, "utf-8"));

  const adminEmail = "admin@nuage.fr";
  const adminPassword = "ChangeThisPassword123!"; // CHANGE THIS!

  const existingAdmin = users.find((u: any) => u.email === adminEmail);
  if (existingAdmin) {
    console.log("Admin user already exists");
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  users.push({
    id: crypto.randomUUID(),
    email: adminEmail,
    passwordHash,
    firstName: "Admin",
    lastName: "User",
    isAdmin: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2));

  console.log("Admin user created:");
  console.log("Email:", adminEmail);
  console.log("Password:", adminPassword);
  console.log("\n⚠️  CHANGE THE PASSWORD IMMEDIATELY AFTER FIRST LOGIN!");
}

createAdmin();
```

Run with: `npx tsx scripts/create-admin.ts`

---

## Implementation Checklist

- [ ] Create `src/middleware.ts` for route protection
- [ ] Add `isAdmin` field to User type and update user functions
- [ ] Protect `/api/orders/by-email` endpoint
- [ ] Install and configure rate limiting
- [ ] Improve password validation
- [ ] Add security headers to `next.config.ts`
- [ ] Create session helper functions
- [ ] Create admin user
- [ ] Test all protected routes
- [ ] Update login/register UI for new password requirements

---

## Testing the Fixes

After implementing the fixes:

1. **Test admin protection:**
   - Try accessing `/admin` without login → should redirect
   - Login as regular user → should redirect (or access if not role-checking yet)
   - Login as admin → should access

2. **Test rate limiting:**
   - Make 6 login attempts quickly → 6th should be blocked
   - Wait 1 minute → should work again

3. **Test password requirements:**
   - Try registering with "password" → should fail
   - Try "Password123!" → should succeed

4. **Test API protection:**
   - Try calling `/api/update-order-tracking` without auth → 401
   - Try calling `/api/orders/by-email` with other user's email → 403

---

**Remember:** Security is an ongoing process. After implementing these fixes, schedule regular security audits and keep dependencies updated.
