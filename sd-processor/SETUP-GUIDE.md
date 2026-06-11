# 🎨 AI Image Processor Setup Guide

Complete setup for processing product images with local Stable Diffusion.

## 📋 Prerequisites

- **GPU**: NVIDIA GPU with 6GB+ VRAM (8-12GB recommended)
- **Python**: 3.10 or 3.11
- **Node.js**: 18+ (already installed)
- **Disk Space**: ~20GB for models

## 🚀 Quick Start (30 minutes)

### Step 1: Install Stable Diffusion

**Option A: Automatic1111 (Recommended for beginners)**

```bash
# 1. Clone repository
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
cd stable-diffusion-webui

# 2. Windows: Edit webui-user.bat and add:
set COMMANDLINE_ARGS=--api --listen

# 3. Run (downloads models automatically on first run)
webui-user.bat

# 4. Wait for "Running on local URL: http://127.0.0.1:7860"
```

**Option B: ComfyUI (More control, advanced users)**

```bash
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
python main.py --listen 0.0.0.0 --port 8188
```

### Step 2: Download Models

**For A1111:**
Place in `stable-diffusion-webui/models/Stable-diffusion/`

**Recommended Models:**
1. **SDXL 1.0** (Best quality, 6.9GB)
   - Download: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
   - File: `sd_xl_base_1.0.safetensors`

2. **Realistic Vision V6** (Great for products, 2GB)
   - Download: https://civitai.com/models/4201/realistic-vision-v60-b1
   - File: `realisticVisionV60B1_v51VAE.safetensors`

### Step 3: Install Python Processor

```bash
# Navigate to processor directory
cd C:\Users\haida\rekebrabe3\sd-processor

# Install dependencies
pip install -r requirements.txt

# Run server
python server.py
```

You should see:
```
==================================================
Stable Diffusion Image Processor
==================================================
SD API: http://127.0.0.1:7860
SD Available: True
==================================================
 * Running on http://0.0.0.0:5001
```

### Step 4: Setup Database

```bash
# Run SQL in Supabase SQL Editor
# Copy contents of database-schema.sql
```

Or via web interface:
1. Go to your Supabase project
2. SQL Editor → New Query
3. Paste contents of `database-schema.sql`
4. Run

### Step 5: Access Admin Interface

```bash
# Start Next.js app (if not running)
npm run dev

# Navigate to:
http://localhost:3000/admin/image-processor
```

## 🎯 Usage

### Process Single Image

1. Navigate to `/admin/image-processor`
2. Check SD Server Status (should be green)
3. Enter image URL
4. Select style (brown-gradient recommended)
5. Click "Process Image"
6. Wait 5-15 seconds
7. Review before/after
8. Approve or reject

### Batch Process

Use API endpoint:
```bash
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

## 🎨 Available Styles

### brown-gradient
Warm brown gradient matching your brand (#85572A)
- Best for: Chichas, premium products
- Style: Warm, luxurious

### minimal-white
Clean white background
- Best for: Accessories, modern look
- Style: Clean, minimal

### custom
Provide your own prompt
- Example: "luxury marble background, gold accents"

## ⚙️ Configuration

Edit `sd-processor/server.py`:

```python
# Change SD API URL if needed
SD_API_URL = "http://127.0.0.1:7860"  # A1111
COMFYUI_API_URL = "http://127.0.0.1:8188"  # ComfyUI

# Use ComfyUI instead
USE_COMFYUI = True
```

## 📊 Performance

### Processing Times (RTX 3060 12GB)
- Background removal: 1-2 sec
- AI enhancement: 5-10 sec
- Total per image: 6-12 sec

### Batch Processing
- 10 images: ~2 minutes
- 50 images: ~10 minutes
- 100 images: ~20 minutes

## 🐛 Troubleshooting

### "SD server not available"
```bash
# Check if SD is running:
curl http://127.0.0.1:7860/sdapi/v1/sd-models

# If error, restart A1111 with --api flag
```

### "CUDA out of memory"
- Reduce image size
- Close other GPU applications
- Use smaller model (SD 1.5 instead of SDXL)

### "Processing too slow"
- Check GPU usage (should be 90-100%)
- Reduce steps in server.py (20 → 15)
- Use faster model

### Images look bad
- Try different model (Realistic Vision recommended)
- Adjust denoising_strength (0.3-0.5)
- Change prompt in API route

## 🎓 Advanced

### Custom Prompts

Edit `src/app/api/admin/process-images/route.ts`:

```typescript
prompt: "your custom prompt here, professional lighting, studio quality"
```

### Add ControlNet

For better control over output:
1. Download ControlNet models
2. Enable in A1111 settings
3. Update server.py to use ControlNet API

### Style Presets

Add more styles in `server.py`:

```python
elif style == "premium-gold":
    # Golden gradient background
    color1 = np.array([50, 150, 200])  # Gold in BGR
    color2 = np.array([20, 100, 150])
```

## 💡 Tips

1. **Test with 1-2 images first** before batch
2. **Keep original images** (stored in database)
3. **Review all processed images** before publishing
4. **Adjust prompts** for specific product types
5. **Use consistent style** across product categories

## 🆘 Support

If you encounter issues:
1. Check server logs: `python server.py`
2. Check SD logs: A1111 console
3. Verify GPU is detected: `nvidia-smi`
4. Test SD web UI: http://127.0.0.1:7860

## 📚 Resources

- [A1111 Wiki](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki)
- [ComfyUI Docs](https://github.com/comfyanonymous/ComfyUI)
- [Civitai Models](https://civitai.com)
- [Hugging Face](https://huggingface.co/models)

## ✅ Ready to Process!

You're all set! Start processing images at:
**http://localhost:3000/admin/image-processor**
