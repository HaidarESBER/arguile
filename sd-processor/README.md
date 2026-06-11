# Stable Diffusion Image Processor

Local AI-powered image processing for product photos.

## Setup

### 1. Install Stable Diffusion (Choose One)

#### Option A: Automatic1111 (Recommended for beginners)
```bash
# Clone
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
cd stable-diffusion-webui

# Run with API enabled
./webui.sh --api --listen
# Windows: webui-user.bat --api --listen
```

#### Option B: ComfyUI (More control)
```bash
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
pip install -r requirements.txt
python main.py --listen 0.0.0.0 --port 8188
```

### 2. Install Python Server Dependencies
```bash
cd sd-processor
pip install -r requirements.txt
```

### 3. Download Models
Place models in:
- **A1111**: `stable-diffusion-webui/models/Stable-diffusion/`
- **ComfyUI**: `ComfyUI/models/checkpoints/`

Recommended models:
- **SDXL 1.0** (best quality): https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- **Realistic Vision** (e-commerce): https://civitai.com/models/4201/realistic-vision-v60-b1

### 4. Run the Server
```bash
python server.py
```

Server runs on: http://localhost:5001

## API Endpoints

### Process Single Image
```bash
POST http://localhost:5001/process-image
Content-Type: application/json

{
  "image_url": "https://example.com/product.jpg",
  "style": "brown-gradient",
  "prompt": "professional product photo, studio lighting",
  "remove_bg": true,
  "use_ai_bg": true
}
```

### Batch Process
```bash
POST http://localhost:5001/batch-process
Content-Type: application/json

{
  "images": [
    {
      "image_url": "https://...",
      "style": "brown-gradient"
    }
  ]
}
```

### Health Check
```bash
GET http://localhost:5001/health
```

## Styles Available

- `brown-gradient` - Warm brown gradient (#85572A)
- `minimal-white` - Clean white background
- Custom prompts supported

## GPU Requirements

- **Minimum**: 6GB VRAM (GTX 1660, RTX 2060)
- **Recommended**: 8-12GB VRAM (RTX 3060, RTX 3080)
- **Optimal**: 16GB+ VRAM (RTX 4080, RTX 4090)

## Performance

- **Background removal**: ~1-2 sec/image
- **AI processing**: ~5-15 sec/image (depends on GPU)
- **Batch**: Processes sequentially
