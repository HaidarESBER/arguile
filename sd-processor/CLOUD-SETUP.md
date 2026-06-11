# 🚀 Cloud AI Image Processing Setup (No GPU Required)

Your AI image processor is ready to use **without a local GPU** using Replicate cloud processing.

---

## ✨ What You Get

- **Professional product photos** - AI-enhanced with consistent styling
- **Background replacement** - Custom branded backgrounds
- **Cloud processing** - No GPU, no expensive hardware needed
- **Free tier** - $5 credit = ~2000 image generations
- **Fast** - 5-10 seconds per image
- **Bulk processing** - Process multiple images at once

---

## 📝 Setup (5 Minutes)

### Step 1: Get Free Replicate API Token

1. Go to **https://replicate.com/account/api-tokens**
2. Sign up with GitHub (takes 30 seconds)
3. Click "Create Token"
4. Copy your token (starts with `r8_...`)

**Free Credits:** New accounts get $5 credit = ~2000 image generations. After that, it's pay-as-you-go ($0.0023 per image).

---

### Step 2: Add Token to Environment

1. Open your project's `.env.local` file (create if it doesn't exist)
2. Add this line:

```env
REPLICATE_API_TOKEN=r8_your_token_here
```

3. Save the file
4. Restart your Next.js dev server:

```bash
npm run dev
```

---

### Step 3: Test It Out

1. Start your dev server: `npm run dev`
2. Navigate to: **http://localhost:3000/admin/image-processor**
3. Paste a product image URL (e.g., from AliExpress)
4. Click "Process Image"
5. Wait 5-10 seconds
6. See the before/after comparison
7. Click "Approve" to save it

---

## 🎨 How It Works

### Available Styles

**brown-gradient** (Default - Matches Your Brand)
- Warm brown gradient background (#85572A)
- Professional studio lighting
- Perfect for chichas and premium products

**minimal-white**
- Clean white background
- Modern, minimalist look
- Great for accessories

**custom**
- Provide your own AI prompt
- Full creative control

---

## 📸 Usage Examples

### Single Image Processing

```typescript
// API call from admin panel
POST /api/admin/process-images
{
  "image_url": "https://example.com/product.jpg",
  "style": "brown-gradient",
  "product_id": "prod_123"
}
```

### Bulk Processing

```bash
# Process multiple images at once
curl -X PUT http://localhost:3000/api/admin/process-images \
  -H "Content-Type: application/json" \
  -d '{
    "images": [
      {"url": "https://...", "product_id": "123"},
      {"url": "https://...", "product_id": "124"}
    ],
    "style": "brown-gradient"
  }'
```

---

## 💰 Cost Breakdown

**Replicate Pricing:**
- **Free tier:** $5 credit (lasts ~2000 images)
- **After free tier:** $0.0023 per image
- **Example:** 100 products = $0.23
- **Example:** 1000 products = $2.30

**Why it's worth it:**
- No GPU purchase ($500-$2000)
- No electricity costs
- No maintenance
- Instant scaling
- Professional results

---

## 🔄 Workflow Integration

### Recommended Process:

1. **Scrape products** from supplier
2. **Bulk process images** with AI (this system)
3. **Review in admin panel** (approve/reject)
4. **Auto-publish approved images** to live site
5. **Track conversions** to optimize styling

### Database Storage:

Processed images are stored in `processed_images` table with:
- Original URL
- Processed image (base64 or URL)
- Status: `pending_review` → `approved` → `published`
- Metadata: style, dimensions, processing time

---

## ⚡ Performance

**Processing Time:**
- Background removal: 1-2 sec (cloud)
- AI enhancement: 5-10 sec (cloud)
- **Total:** 6-12 sec per image

**Quality:**
- Uses SDXL (Stable Diffusion XL) - industry standard
- 1024x1024 output resolution
- Professional studio lighting
- Consistent brand styling

---

## 🎯 Next Steps

### Phase 1: Basic Usage ✅
- [x] Process single images
- [x] Review and approve
- [ ] Approve and use in products

### Phase 2: Automation
- [ ] Auto-process scraped products
- [ ] Batch approval workflow
- [ ] Auto-publish approved images

### Phase 3: Advanced (Optional)
- [ ] OCR text detection on images
- [ ] Auto-translate English → French
- [ ] A/B test different styles
- [ ] Track which styles convert best

---

## 🐛 Troubleshooting

### "No processing method available"
**Problem:** No API token set
**Solution:** Add `REPLICATE_API_TOKEN` to `.env.local` and restart server

### Processing fails with 401 error
**Problem:** Invalid or expired token
**Solution:** Generate new token at replicate.com/account/api-tokens

### Images look bad
**Problem:** Wrong prompt or style
**Solution:** Try different styles or customize prompt in `src/app/api/admin/process-images/route.ts`

### Too slow
**Problem:** Cloud processing takes time
**Solution:** Consider local GPU setup (see SETUP-GUIDE.md) for 2-3x faster processing

---

## 🎓 Advanced Configuration

### Custom Prompts

Edit `src/app/api/admin/process-images/route.ts` line 83:

```typescript
prompt: `professional product photo, ${style} background, studio lighting, e-commerce, 4k, high quality, detailed`
```

### Custom Styles

Add new styles in admin panel or API:

```typescript
{
  "style": "custom",
  "custom_prompt": "luxury marble background, gold accents, dramatic lighting"
}
```

### Different AI Models

Change model in `route.ts` line 79:

```typescript
// Current: SDXL (best quality)
"stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"

// Alternative: Realistic Vision (faster, good for products)
"stability-ai/sdxl:2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2"
```

Browse more models: https://replicate.com/collections/text-to-image

---

## 🚀 Upgrade to Local GPU (Optional)

If you later get an NVIDIA GPU (6GB+ VRAM), you can:

1. Run the automated setup: `sd-processor/install-windows.bat`
2. Start local Stable Diffusion
3. Set `SD_SERVER_URL=http://localhost:7860` in `.env.local`
4. System will automatically use local GPU (2-3x faster + unlimited free processing)

See **SETUP-GUIDE.md** for full local setup instructions.

---

## 📊 Success Metrics

Track your results:
- **Processing speed:** Target 10 sec/image
- **Approval rate:** Target 80%+ approved
- **Cost efficiency:** $0.002-0.003 per image
- **Conversion lift:** Compare styled vs original images

---

## ✅ You're All Set!

Your AI image processor is ready to use. Start processing at:

👉 **http://localhost:3000/admin/image-processor**

**Questions?** Check the main SETUP-GUIDE.md or the API docs in the route file.

---

Made with ❤️ using Replicate + Stable Diffusion XL
