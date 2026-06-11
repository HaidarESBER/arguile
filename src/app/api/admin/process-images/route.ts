import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { HfInference } from "@huggingface/inference";

/**
 * API endpoint to process product images with Hugging Face AI
 * 100% FREE - No GPU required - Uses cloud processing
 * Get FREE API key from: https://huggingface.co/settings/tokens
 */

const SD_SERVER_URL = process.env.SD_SERVER_URL || "http://localhost:5001";

const hf = process.env.HUGGINGFACE_API_TOKEN
  ? new HfInference(process.env.HUGGINGFACE_API_TOKEN)
  : null;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check admin status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { image_url, style = "brown-gradient", product_id } = body;

    if (!image_url) {
      return NextResponse.json(
        { error: "image_url is required" },
        { status: 400 }
      );
    }

    let result: { success?: boolean; image: string; width?: number; height?: number };

    // Try local SD first, fallback to Replicate
    const healthCheck = await fetch(`${SD_SERVER_URL}/health`, {
      method: "GET",
    }).catch(() => null);

    if (healthCheck?.ok) {
      // Use local SD
      const response = await fetch(`${SD_SERVER_URL}/process-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url,
          style,
          prompt: "professional product photo for e-commerce, studio lighting, clean background",
          remove_bg: true,
          use_ai_bg: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Local SD processing failed");
      }

      result = await response.json();
    } else if (hf) {
      // Use Hugging Face cloud (FREE, no GPU needed) - Image to Image
      try {
        // Fetch the original image
        const imageResponse = await fetch(image_url);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
        }
        const imageBlob = await imageResponse.blob();

        // Use Stable Diffusion for image-to-image transformation
        const output = await hf.imageToImage({
          model: "stabilityai/stable-diffusion-2-1",
          inputs: imageBlob,
          parameters: {
            prompt: `professional product photography with ${style} gradient background, studio lighting, clean backdrop, e-commerce product photo, high quality, centered`,
            negative_prompt: "blurry, low quality, distorted, amateur, cluttered background, text, watermark",
            guidance_scale: 7.5,
            num_inference_steps: 30,
            strength: 0.75,
          },
        });

        // Convert blob to base64
        const arrayBuffer = await output.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const dataUrl = `data:image/png;base64,${base64}`;

        result = {
          success: true,
          image: dataUrl,
          width: 1024,
          height: 1024,
        };
      } catch (error) {
        console.error("Hugging Face error:", error);
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Hugging Face processing failed: ${message}`);
      }
    } else {
      return NextResponse.json(
        {
          error: "No processing method available",
          message: "Set HUGGINGFACE_API_TOKEN in .env.local (FREE) or run local SD server",
        },
        { status: 503 }
      );
    }

    // Store processed image for review in Supabase
    const { data: processedImage, error: dbError } = await supabase
      .from("processed_images")
      .insert({
        product_id,
        original_url: image_url,
        processed_data: result.image, // base64
        status: "pending_review",
        processing_metadata: {
          style,
          width: result.width,
          height: result.height,
          processed_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error("Error storing processed image:", dbError);
      // Return result anyway, just log the error
    }

    return NextResponse.json({
      success: true,
      processed_image: result.image,
      width: result.width,
      height: result.height,
      record_id: processedImage?.id,
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      {
        error: "Processing failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Batch process multiple images
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { images, style = "brown-gradient" } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "images array is required" },
        { status: 400 }
      );
    }

    // Process batch
    const response = await fetch(`${SD_SERVER_URL}/batch-process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        images: images.map((img) => ({
          image_url: img.url,
          style,
        })),
      }),
      // Long timeout for batch processing
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Batch processing failed");
    }

    // Store all in database
    const records = result.results.map((res: { image: string }, idx: number) => ({
      product_id: images[idx].product_id,
      original_url: images[idx].url,
      processed_data: res.image,
      status: "pending_review",
      processing_metadata: {
        style,
        batch_id: Date.now(),
      },
    }));

    await supabase.from("processed_images").insert(records);

    return NextResponse.json({
      success: true,
      processed: result.results.length,
      results: result.results,
    });
  } catch (error) {
    console.error("Error batch processing:", error);
    return NextResponse.json(
      {
        error: "Batch processing failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
