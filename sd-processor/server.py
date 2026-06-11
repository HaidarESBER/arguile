"""
Local Stable Diffusion Image Processor
Handles background replacement and text translation
"""

import os
import base64
import json
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import requests
from rembg import remove
import cv2
import numpy as np

app = Flask(__name__)
CORS(app)

# Configuration
SD_API_URL = "http://127.0.0.1:7860"  # A1111 default
COMFYUI_API_URL = "http://127.0.0.1:8188"  # ComfyUI default
USE_COMFYUI = False  # Set to True if using ComfyUI

def remove_background(image):
    """Remove background from image using rembg"""
    return remove(image)

def create_styled_background(width, height, style="brown-gradient"):
    """Create consistent styled background"""
    bg = np.zeros((height, width, 3), dtype=np.uint8)

    if style == "brown-gradient":
        # Create warm brown gradient matching #85572A
        color1 = np.array([42, 87, 133])  # #85572A in BGR
        color2 = np.array([30, 60, 100])  # Darker shade

        for i in range(height):
            ratio = i / height
            color = color1 * (1 - ratio) + color2 * ratio
            bg[i, :] = color.astype(np.uint8)

    elif style == "minimal-white":
        bg[:] = [245, 245, 245]  # Light gray

    return Image.fromarray(cv2.cvtColor(bg, cv2.COLOR_BGR2RGB))

def process_with_sd_api(image, prompt, negative_prompt=""):
    """Process image with Stable Diffusion (A1111 API)"""
    # Convert image to base64
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()

    payload = {
        "init_images": [img_str],
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "steps": 20,
        "cfg_scale": 7,
        "denoising_strength": 0.4,  # Keep product, change background
        "width": image.width,
        "height": image.height,
    }

    response = requests.post(
        f"{SD_API_URL}/sdapi/v1/img2img",
        json=payload,
        timeout=300
    )

    if response.status_code == 200:
        r = response.json()
        img_data = base64.b64decode(r['images'][0])
        return Image.open(io.BytesIO(img_data))
    else:
        raise Exception(f"SD API error: {response.status_code}")

def process_with_comfyui(image, prompt):
    """Process image with ComfyUI API"""
    # ComfyUI workflow would go here
    # More complex but more control
    pass

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "sd_available": check_sd_available()})

@app.route('/process-image', methods=['POST'])
def process_image():
    """
    Main endpoint to process product images

    Body:
    {
        "image_url": "https://...",
        "style": "brown-gradient",
        "prompt": "professional product photo...",
        "remove_bg": true,
        "use_ai_bg": true
    }
    """
    try:
        data = request.json
        image_url = data.get('image_url')
        style = data.get('style', 'brown-gradient')
        prompt = data.get('prompt', 'professional product photo, studio lighting, e-commerce')
        remove_bg = data.get('remove_bg', True)
        use_ai_bg = data.get('use_ai_bg', True)

        # Download image
        response = requests.get(image_url)
        image = Image.open(io.BytesIO(response.content)).convert('RGBA')

        # Step 1: Remove background if requested
        if remove_bg:
            print("Removing background...")
            image = remove_background(image)

        # Step 2: Process with AI or simple background
        if use_ai_bg and check_sd_available():
            print("Processing with Stable Diffusion...")
            # Create composite with styled background first
            bg = create_styled_background(image.width, image.height, style)
            composite = Image.alpha_composite(
                bg.convert('RGBA'),
                image
            )

            # Enhance with SD
            full_prompt = f"{prompt}, {style} background, studio lighting, professional e-commerce photo"
            result = process_with_sd_api(
                composite.convert('RGB'),
                full_prompt,
                "ugly, deformed, noisy, blurry, distorted"
            )
        else:
            print("Using simple background...")
            # Simple background replacement
            bg = create_styled_background(image.width, image.height, style)
            result = Image.alpha_composite(
                bg.convert('RGBA'),
                image
            ).convert('RGB')

        # Convert to base64 for response
        buffered = io.BytesIO()
        result.save(buffered, format="PNG", quality=95)
        img_str = base64.b64encode(buffered.getvalue()).decode()

        return jsonify({
            "success": True,
            "image": f"data:image/png;base64,{img_str}",
            "width": result.width,
            "height": result.height
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/batch-process', methods=['POST'])
def batch_process():
    """Process multiple images"""
    try:
        data = request.json
        images = data.get('images', [])
        results = []

        for idx, img_data in enumerate(images):
            print(f"Processing image {idx + 1}/{len(images)}...")
            result = process_image_internal(img_data)
            results.append(result)

        return jsonify({
            "success": True,
            "results": results
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

def check_sd_available():
    """Check if Stable Diffusion API is available"""
    try:
        if USE_COMFYUI:
            response = requests.get(f"{COMFYUI_API_URL}/system_stats", timeout=2)
        else:
            response = requests.get(f"{SD_API_URL}/sdapi/v1/sd-models", timeout=2)
        return response.status_code == 200
    except:
        return False

if __name__ == '__main__':
    print("=" * 50)
    print("Stable Diffusion Image Processor")
    print("=" * 50)
    print(f"SD API: {SD_API_URL}")
    print(f"SD Available: {check_sd_available()}")
    print("=" * 50)

    app.run(host='0.0.0.0', port=5001, debug=True)
