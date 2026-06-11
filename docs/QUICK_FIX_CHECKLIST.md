# 🚨 Critical Security Fixes Checklist

**BEFORE PRODUCTION DEPLOYMENT - DO ALL OF THESE**

---

## ✅ Phase 1: Critical Security (DO FIRST)

### 1. Create Middleware for Route Protection
- [ ] Create `src/middleware.ts`
- [ ] Protect `/admin/*` routes
- [ ] Protect admin API routes
- [ ] Test: Try accessing /admin without login → should redirect
- [ ] Test: Login and access /admin → should work

**File:** `src/middleware.ts`
**Time:** 30 minutes
**See:** SECURITY_FIXES_GUIDE.md - Section 1

---

### 2. Add Admin Role to Users
- [ ] Update `src/types/user.ts` - add `isAdmin?: boolean`
- [ ] Update `src/lib/users.ts` - include isAdmin in sessions
- [ ] Create admin user script
- [ ] Run script to create first admin
- [ ] Test: Admin login should work

**Files:** `src/types/user.ts`, `src/lib/users.ts`, `scripts/create-admin.ts`
**Time:** 20 minutes
**See:** SECURITY_FIXES_GUIDE.md - Section 2

---

### 3. Protect Order Query API
- [ ] Update `src/app/api/orders/by-email/route.ts`
- [ ] Add authentication check
- [ ] Add authorization (user can only see own orders)
- [ ] Test: Unauthenticated request → 401
- [ ] Test: User A cannot access User B's orders → 403

**File:** `src/app/api/orders/by-email/route.ts`
**Time:** 15 minutes
**See:** SECURITY_FIXES_GUIDE.md - Section 3

---

### 4. Protect Order Tracking Update API
- [ ] Update `src/app/api/update-order-tracking/route.ts`
- [ ] Add admin authentication check
- [ ] Test: Non-admin request → 403
- [ ] Test: Admin request → works

**File:** `src/app/api/update-order-tracking/route.ts`
**Time:** 10 minutes
**See:** Middleware handles this once created

---

### 5. Protect Email Sending APIs
- [ ] Update `src/app/api/send-order-email/route.ts`
- [ ] Update `src/app/api/send-shipping-email/route.ts`
- [ ] Add admin authentication to both
- [ ] Test: Public request → 401

**Files:** Email API routes
**Time:** 10 minutes
**See:** Middleware handles this once created

---

## ⏱️ Phase 1 Total Time: ~2 hours

---

## ✅ Phase 2: High Priority (DO NEXT)

### 6. Add Rate Limiting
- [ ] Install: `npm install @upstash/ratelimit @upstash/redis`
- [ ] Create `src/lib/rate-limit.ts`
- [ ] Add to login endpoint (5 attempts/minute)
- [ ] Add to registration endpoint
- [ ] Test: Make 6 login attempts → 6th blocked

**Time:** 1 hour
**See:** SECURITY_FIXES_GUIDE.md - Section 4

---

### 7. Strengthen Password Requirements
- [ ] Update `src/lib/users.ts`
- [ ] Add `validatePassword()` function
- [ ] Require 12 chars, uppercase, lowercase, number, special
- [ ] Test: Weak password → rejected
- [ ] Update UI to show requirements

**Time:** 30 minutes
**See:** SECURITY_FIXES_GUIDE.md - Section 5

---

### 8. Add Security Headers
- [ ] Update `next.config.ts`
- [ ] Add `headers()` function
- [ ] Include all security headers
- [ ] Test: Check response headers in browser

**Time:** 15 minutes
**See:** SECURITY_FIXES_GUIDE.md - Section 6

---

### 9. Create Session Helper Functions
- [ ] Create `src/lib/session.ts`
- [ ] Add `getSession()`, `requireAuth()`, `requireAdmin()`
- [ ] Use in protected routes
- [ ] Test: Helpers work correctly

**Time:** 30 minutes
**See:** SECURITY_FIXES_GUIDE.md - Section 7

---

### 10. Fix Image Loading Issue
- [ ] Update `next.config.ts`
- [ ] Add `dangerouslyAllowSVG: true`
- [ ] Add security CSP for images
- [ ] Test: Images load correctly

**Time:** 5 minutes
**See:** TESTING_REPORT.md - Runtime Issues

---

## ⏱️ Phase 2 Total Time: ~3 hours

---

## ✅ Phase 3: Before Production

### Database Migration
- [ ] Choose database (PostgreSQL recommended)
- [ ] Set up database instance
- [ ] Create schema/tables
- [ ] Migrate data from JSON files
- [ ] Update data access functions
- [ ] Test all CRUD operations

**Time:** 4-6 hours

---

### Email Configuration
- [ ] Verify domain with Resend
- [ ] Update email "from" addresses
- [ ] Test order confirmation emails
- [ ] Test shipping notification emails

**Time:** 1 hour

---

### Environment Setup
- [ ] Set production environment variables
- [ ] Configure Redis for sessions
- [ ] Set up monitoring (Sentry)
- [ ] Configure CDN
- [ ] Set up CI/CD

**Time:** 2-3 hours

---

### Final Testing
- [ ] Test complete checkout flow
- [ ] Test admin panel access
- [ ] Test all API endpoints
- [ ] Test rate limiting
- [ ] Test email delivery
- [ ] Test on mobile devices
- [ ] Run performance tests

**Time:** 2-3 hours

---

## ⏱️ Phase 3 Total Time: ~10-15 hours

---

## 📋 Quick Test Commands

```bash
# Check for vulnerabilities
npm audit

# Run production build
npm run build

# Start dev server
npm run dev

# Type check
npm run lint

# Create admin user (after creating script)
npx tsx scripts/create-admin.ts
```

---

## 🎯 Success Criteria

### You're ready for production when:
- [x] All Phase 1 tasks completed
- [x] All Phase 2 tasks completed
- [x] Database migration done
- [x] All tests passing
- [x] Security headers present
- [x] Admin panel protected
- [x] API endpoints protected
- [x] Rate limiting active
- [x] Monitoring configured
- [x] Email service working

---

## 🆘 If You Get Stuck

1. **Check the detailed guides:**
   - `SECURITY_FIXES_GUIDE.md` - Full code examples
   - `SECURITY_AUDIT_REPORT.md` - Complete vulnerability list
   - `TESTING_REPORT.md` - Quality issues

2. **Common issues:**
   - Middleware not running? Check `config.matcher` paths
   - Session not found? Check cookie name matches
   - Rate limiting not working? Verify Redis connection

3. **Test as you go:**
   - Don't wait until the end
   - Test each fix individually
   - Use browser DevTools Network tab
   - Check server logs

---

## 📊 Progress Tracker

```
Phase 1: Critical Security
□□□□□ 0/5 completed

Phase 2: High Priority
□□□□□ 0/5 completed

Phase 3: Production Ready
□□□□ 0/4 completed

Overall Progress: 0/14 tasks (0%)
```

---

## 🎉 After Completion

Once all tasks are done:
1. ✅ Run full test suite
2. ✅ Deploy to staging environment
3. ✅ Perform manual testing
4. ✅ Run security scan
5. ✅ Deploy to production
6. ✅ Monitor for issues
7. ✅ Celebrate! 🎊

---

**Start with Phase 1 - It's the most critical!**

Good luck! 🚀
