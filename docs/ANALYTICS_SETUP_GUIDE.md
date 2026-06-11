# 📊 Analytics Setup Guide

Complete guide to setting up tracking and analytics for Nuage.

## 🎯 Overview

Your site is integrated with 4 analytics platforms:

1. **Google Analytics 4** (GA4) - Website traffic & conversions
2. **Microsoft Clarity** - User behavior & heatmaps
3. **TikTok Pixel** - TikTok ads conversion tracking
4. **Meta Pixel** - Facebook/Instagram ads conversion tracking

**All analytics respect RGPD/GDPR cookie consent** - they only load after users accept analytics/marketing cookies.

---

## 🔐 Privacy & Compliance

✅ **RGPD/GDPR Compliant**
- Analytics scripts load ONLY after user consent
- Users can granularly accept/reject analytics vs marketing
- No tracking for users who reject consent
- Consent expires after 6 months (re-asks user)

✅ **What's tracked:**
- Page views
- Product views
- Add to cart / Remove from cart
- Purchase conversions
- Search queries
- Wishlist interactions
- Core Web Vitals (performance)

---

## 1️⃣ Google Analytics 4 Setup

**Time:** 15 minutes
**Consent required:** Analytics

### Steps:

1. **Create GA4 Property**
   - Go to [Google Analytics](https://analytics.google.com)
   - Click "Admin" → "Create Property"
   - Enter property name: "Nuage"
   - Select timezone: France
   - Select currency: EUR

2. **Get Measurement ID**
   - In property settings, click "Data Streams"
   - Click "Add stream" → "Web"
   - Enter URL: `https://nuage.fr` (or your domain)
   - Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

3. **Add to Environment Variables**
   ```bash
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

4. **Configure Enhanced Measurement (Recommended)**
   - In the stream settings, enable:
     - ✅ Page views (auto)
     - ✅ Scrolls
     - ✅ Outbound clicks
     - ✅ Site search
     - ✅ Form interactions
     - ✅ File downloads

5. **Set up E-commerce Reporting**
   - Go to Admin → Property → Data display
   - Toggle "Enable enhanced e-commerce reporting"

### What GA4 tracks:

- Traffic sources (organic, direct, referral, social, paid)
- User demographics & interests
- Device types & browsers
- Conversion funnel (product view → add to cart → purchase)
- Revenue & transaction data
- Custom events (wishlist, comparisons, exit intent)

---

## 2️⃣ Microsoft Clarity Setup

**Time:** 10 minutes
**Consent required:** Analytics

### Steps:

1. **Create Project**
   - Go to [Microsoft Clarity](https://clarity.microsoft.com)
   - Sign in with Microsoft account (free)
   - Click "New Project"
   - Enter name: "Nuage"
   - Enter URL: `https://nuage.fr`

2. **Get Project ID**
   - After creating project, go to Settings
   - Copy the **Project ID** (format: alphanumeric string)

3. **Add to Environment Variables**
   ```bash
   NEXT_PUBLIC_CLARITY_PROJECT_ID=abc123def456
   ```

### What Clarity tracks:

- **Session recordings** - Watch real user sessions
- **Heatmaps** - Click, scroll, and attention heatmaps
- **Rage clicks** - Detect frustrated users
- **Dead clicks** - Identify broken interactions
- **Excessive scrolling** - Find confusing pages
- **Quick backs** - Users leaving pages quickly

### Pro tip:
Check Clarity weekly to identify UX issues. Filter by "Rage clicks" to find bugs quickly.

---

## 3️⃣ TikTok Pixel Setup

**Time:** 15 minutes
**Consent required:** Marketing

### Steps:

1. **Access TikTok Ads Manager**
   - Go to [TikTok Ads](https://ads.tiktok.com)
   - Create account or sign in
   - Complete business verification (required)

2. **Create Pixel**
   - Go to Assets → Events
   - Click "Web Events"
   - Click "Manage" → "Create Pixel"
   - Select "TikTok Pixel"
   - Name: "Nuage Website"

3. **Get Pixel ID**
   - After creating pixel, click "Get Pixel Code"
   - Copy the **Pixel ID** (format: alphanumeric string)

4. **Add to Environment Variables**
   ```bash
   NEXT_PUBLIC_TIKTOK_PIXEL_ID=C1234ABCD5678EFGH
   ```

5. **Verify Installation (After Deploy)**
   - Install TikTok Pixel Helper Chrome extension
   - Visit your site
   - Accept marketing cookies
   - Extension should show pixel firing

### What TikTok Pixel tracks:

- **Standard Events:**
  - `PageView` - All page loads
  - `AddToCart` - Product added to cart
  - `CompletePayment` - Purchase completed
  - `ViewContent` - Product page views

- **Use cases:**
  - Retarget website visitors on TikTok
  - Create lookalike audiences
  - Track ROAS (Return on Ad Spend)
  - Optimize ad delivery for conversions

---

## 4️⃣ Meta Pixel Setup (Facebook/Instagram)

**Time:** 15 minutes
**Consent required:** Marketing

### Steps:

1. **Access Meta Business Manager**
   - Go to [Meta Business](https://business.facebook.com)
   - Create business account or sign in

2. **Create Pixel**
   - Go to Events Manager
   - Click "Connect Data Sources" → "Web"
   - Select "Meta Pixel" → "Connect"
   - Name: "Nuage Website"
   - Enter URL: `https://nuage.fr`

3. **Get Pixel ID**
   - After creating pixel, go to Settings
   - Copy the **Pixel ID** (format: numeric)

4. **Add to Environment Variables**
   ```bash
   NEXT_PUBLIC_META_PIXEL_ID=1234567890123456
   ```

5. **Verify Installation (After Deploy)**
   - Install Meta Pixel Helper Chrome extension
   - Visit your site
   - Accept marketing cookies
   - Extension should show pixel firing (green checkmark)

6. **Configure Conversions API (Advanced - Optional)**
   - For better tracking (bypasses ad blockers)
   - Go to Events Manager → Settings → Conversions API
   - Follow setup for server-side events

### What Meta Pixel tracks:

- **Standard Events:**
  - `PageView` - All page loads
  - `ViewContent` - Product page views
  - `AddToCart` - Product added to cart
  - `Purchase` - Purchase completed

- **Use cases:**
  - Retarget website visitors on Facebook/Instagram
  - Create custom audiences
  - Track conversions from FB/IG ads
  - Build lookalike audiences

---

## 🧪 Testing Analytics

After setting up all IDs:

### 1. Test in Development:

```bash
# Make sure env vars are set
cat .env.local

# Run dev server
npm run dev
```

### 2. Open Site & Check Console:

- Open browser DevTools (F12)
- Check console for analytics events:
  ```
  📊 Analytics: page_view
  Data: { url: '/' }
  ```

### 3. Test Cookie Consent Flow:

1. Clear cookies (`Ctrl+Shift+Delete`)
2. Reload page
3. Scroll down 400px
4. Cookie popup should appear
5. Click "Accepter" (accept all)
6. Page reloads
7. Check Network tab - should see requests to:
   - `google-analytics.com`
   - `clarity.ms`
   - `analytics.tiktok.com`
   - `facebook.net/fbevents.js`

### 4. Test E-commerce Tracking:

1. View a product → Check analytics for `product_view`
2. Add to cart → Check analytics for `add_to_cart`
3. Complete checkout → Check analytics for `purchase`

### 5. Verify in Analytics Dashboards:

- **GA4:** Real-time reports should show your session
- **Clarity:** Recordings appear within 2 minutes
- **TikTok:** Events Manager shows events (may take 10 min)
- **Meta:** Events Manager shows events (may take 5 min)

---

## 📈 ROI Tracking

### Key Metrics to Monitor:

| Metric | Target | Where to Find |
|--------|--------|---------------|
| **Conversion Rate** | 1.5-3% | GA4 → Reports → Conversions |
| **Add to Cart Rate** | 15-25% | GA4 → Reports → Events |
| **Average Order Value** | €45-60 | GA4 → Reports → Revenue |
| **ROAS (TikTok)** | 8:1 - 12:1 | TikTok Ads → Campaign Reports |
| **ROAS (Meta)** | 6:1 - 10:1 | Meta Ads Manager → Ad Sets |
| **Bounce Rate** | <50% | GA4 → Reports → Engagement |
| **Page Speed (LCP)** | <2.5s | GA4 → Web Vitals or Clarity |

### Weekly Analytics Checklist:

**Monday Morning:**
- [ ] Check GA4 traffic trends (week-over-week)
- [ ] Review Clarity recordings for UX issues
- [ ] Check TikTok ad ROAS
- [ ] Check Meta ad ROAS
- [ ] Identify best-performing products

**Action items based on data:**
- Low conversion? → Check Clarity for UX friction
- High bounce on product pages? → Improve images/descriptions
- Low ROAS? → Pause underperforming ad creative
- High ROAS? → Scale winning campaigns

---

## 🚨 Troubleshooting

### Analytics not loading?

1. **Check cookie consent:**
   ```javascript
   // In browser console:
   localStorage.getItem('nuage_cookie_consent')
   // Should show: {"analytics":true,"marketing":true,...}
   ```

2. **Check environment variables:**
   ```bash
   # Make sure IDs are set
   echo $NEXT_PUBLIC_GA_MEASUREMENT_ID
   ```

3. **Check browser extensions:**
   - Disable ad blockers
   - uBlock Origin blocks GA/FB by default

### Events not showing in dashboards?

- GA4: Can take 24-48 hours for full reports
- Clarity: Recordings appear within 2-10 minutes
- TikTok: Events can take 10-30 minutes
- Meta: Events appear within 5-20 minutes

### Ad blockers blocking pixels?

- Expected - ~25-40% of users have ad blockers
- Focus on server-side tracking (Conversions API) for critical events
- Use GA4 measurement protocol for server-side e-commerce tracking

---

## 🎓 Best Practices

### 1. Privacy First
- Never track PII (personally identifiable information)
- Respect user consent choices
- Provide easy opt-out (cookie settings)

### 2. Data Hygiene
- Use consistent naming conventions for events
- Set up filters to exclude internal traffic (your IP)
- Regularly audit and clean up old custom dimensions

### 3. Attribution
- Use UTM parameters for all marketing links:
  ```
  https://nuage.fr?utm_source=tiktok&utm_medium=cpc&utm_campaign=launch
  ```

### 4. Regular Monitoring
- Set up GA4 alerts for traffic drops/spikes
- Check Clarity weekly for UX issues
- Review ad pixel health in Events Managers

---

## 📞 Support

**GA4:** [Google Analytics Help](https://support.google.com/analytics)
**Clarity:** [Microsoft Clarity Docs](https://learn.microsoft.com/en-us/clarity/)
**TikTok Pixel:** [TikTok Ads Help Center](https://ads.tiktok.com/help)
**Meta Pixel:** [Meta Business Help](https://www.facebook.com/business/help)

---

## ✅ Implementation Checklist

- [ ] Create GA4 property and get Measurement ID
- [ ] Create Clarity project and get Project ID
- [ ] Create TikTok Pixel and get Pixel ID
- [ ] Create Meta Pixel and get Pixel ID
- [ ] Add all IDs to `.env.local`
- [ ] Deploy to production
- [ ] Test cookie consent flow
- [ ] Verify all pixels firing (browser extensions)
- [ ] Check real-time reports in all dashboards
- [ ] Set up conversion goals in GA4
- [ ] Create custom audiences in TikTok/Meta for retargeting
- [ ] Set up weekly analytics review routine

**Time to complete:** ~60 minutes
**Cost:** Free (all platforms have free tiers)
