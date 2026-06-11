/**
 * Image processor for aggressive optimization and Supabase Storage upload
 *
 * Key features:
 * - Download images with User-Agent headers
 * - Aggressive optimization: <500KB target per image
 * - WebP format with adaptive quality
 * - Resize to max 1200x1200 (maintain aspect ratio)
 * - Upload to Supabase Storage product-images bucket
 * - Concurrent processing with limit
 */

import sharp from 'sharp';
import { createAdminClient } from '@/lib/supabase/admin';

// =============================================================================
// Configuration
// =============================================================================

const MAX_FILE_SIZE_KB = 500; // 500KB target
const MAX_DIMENSION = 1200; // Max width or height
const INITIAL_QUALITY = 80;
const FALLBACK_QUALITY = 70;
const LAST_RESORT_QUALITY = 60;
const FALLBACK_DIMENSION = 800;
const STORAGE_BUCKET = 'product-images';

// =============================================================================
// Image Processing & Upload
// =============================================================================

/**
 * Download, optimize, and upload a single image
 *
 * @param imageUrl - Source image URL
 * @param folder - Folder path within bucket (e.g., "products/123")
 * @returns Object with public URL and metadata
 */
export async function processAndUploadImage(
  imageUrl: string,
  folder: string
): Promise<{
  url: string;
  width: number;
  height: number;
  size: number;
  originalUrl: string;
}> {
  try {
    // 1. Download image
    const imageBuffer = await downloadImage(imageUrl);

    // 2. Optimize image
    const optimized = await optimizeImage(imageBuffer);

    // 3. Upload to Supabase Storage
    const filename = generateFilename();
    const path = `${folder}/${filename}`;
    const publicUrl = await uploadToStorage(path, optimized.buffer);

    return {
      url: publicUrl,
      width: optimized.width,
      height: optimized.height,
      size: optimized.size,
      originalUrl: imageUrl,
    };
  } catch (error) {
    console.error(`Failed to process image ${imageUrl}:`, error);
    throw error;
  }
}

/**
 * Batch process and upload multiple images with concurrency control
 *
 * @param imageUrls - Array of source image URLs
 * @param folder - Folder path within bucket
 * @param concurrency - Max parallel uploads (default: 2)
 * @returns Array of successful uploads and errors
 */
export async function processAndUploadImages(
  imageUrls: string[],
  folder: string,
  concurrency: number = 2
): Promise<{
  successful: {
    url: string;
    width: number;
    height: number;
    size: number;
    originalUrl: string;
  }[];
  errors: { originalUrl: string; error: string }[];
}> {
  const successful: {
    url: string;
    width: number;
    height: number;
    size: number;
    originalUrl: string;
  }[] = [];
  const errors: { originalUrl: string; error: string }[] = [];

  // Process images in batches to control concurrency
  for (let i = 0; i < imageUrls.length; i += concurrency) {
    const batch = imageUrls.slice(i, i + concurrency);
    const promises = batch.map(async (url) => {
      try {
        const result = await processAndUploadImage(url, folder);
        successful.push(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ originalUrl: url, error: errorMessage });
      }
    });

    await Promise.all(promises);
  }

  console.log(
    `Image processing complete: ${successful.length} successful, ${errors.length} failed`
  );

  return { successful, errors };
}

// =============================================================================
// Image Download
// =============================================================================

/**
 * Download image from URL with proper headers
 */
async function downloadImage(url: string): Promise<Buffer> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Image download timeout after 30 seconds');
    }

    throw error;
  }
}

// =============================================================================
// Image Optimization
// =============================================================================

/**
 * Aggressively optimize image to <500KB
 * Strategy:
 * 1. Resize to max 1200x1200, convert to WebP, quality 80
 * 2. If still >500KB: reduce quality to 70
 * 3. If still >500KB: reduce quality to 60
 * 4. If still >500KB: resize to 800x800
 */
async function optimizeImage(buffer: Buffer): Promise<{
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
}> {
  let result = await resizeAndCompress(buffer, MAX_DIMENSION, INITIAL_QUALITY);

  // If too large, reduce quality
  if (result.size > MAX_FILE_SIZE_KB * 1024) {
    console.log(
      `Image ${(result.size / 1024).toFixed(0)}KB > ${MAX_FILE_SIZE_KB}KB, reducing quality to ${FALLBACK_QUALITY}`
    );
    result = await resizeAndCompress(buffer, MAX_DIMENSION, FALLBACK_QUALITY);
  }

  // If still too large, reduce quality more
  if (result.size > MAX_FILE_SIZE_KB * 1024) {
    console.log(
      `Image ${(result.size / 1024).toFixed(0)}KB > ${MAX_FILE_SIZE_KB}KB, reducing quality to ${LAST_RESORT_QUALITY}`
    );
    result = await resizeAndCompress(buffer, MAX_DIMENSION, LAST_RESORT_QUALITY);
  }

  // Last resort: reduce dimensions
  if (result.size > MAX_FILE_SIZE_KB * 1024) {
    console.log(
      `Image ${(result.size / 1024).toFixed(0)}KB > ${MAX_FILE_SIZE_KB}KB, resizing to ${FALLBACK_DIMENSION}x${FALLBACK_DIMENSION}`
    );
    result = await resizeAndCompress(buffer, FALLBACK_DIMENSION, LAST_RESORT_QUALITY);
  }

  console.log(
    `Optimized image: ${result.width}x${result.height}, ${(result.size / 1024).toFixed(0)}KB`
  );

  return result;
}

/**
 * Resize and compress image with Sharp
 */
async function resizeAndCompress(
  buffer: Buffer,
  maxDimension: number,
  quality: number
): Promise<{
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
}> {
  const image = sharp(buffer);

  // Resize maintaining aspect ratio
  image.resize(maxDimension, maxDimension, {
    fit: 'inside',
    withoutEnlargement: true,
  });

  // Convert to WebP with specified quality
  const processedBuffer = await image.webp({ quality }).toBuffer();

  // Get final dimensions
  const finalMetadata = await sharp(processedBuffer).metadata();

  return {
    buffer: processedBuffer,
    width: finalMetadata.width || maxDimension,
    height: finalMetadata.height || maxDimension,
    size: processedBuffer.length,
  };
}

// =============================================================================
// Supabase Storage Upload
// =============================================================================

/**
 * Upload image buffer to Supabase Storage
 * @param path - Path within bucket (e.g., "products/123/image-abc.webp")
 * @param buffer - Image buffer
 * @returns Public URL
 */
async function uploadToStorage(path: string, buffer: Buffer): Promise<string> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, buffer, {
      contentType: 'image/webp',
      cacheControl: '31536000', // 1 year cache
      upsert: true, // Overwrite if exists
    });

  if (error) {
    throw new Error(`Failed to upload to storage: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  return publicUrl;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Generate unique filename for image
 */
function generateFilename(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.webp`;
}

/**
 * Ensure storage bucket exists (call this during setup)
 */
export async function ensureStorageBucket(): Promise<void> {
  const supabase = createAdminClient();

  // Check if bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some((b) => b.name === STORAGE_BUCKET);

  if (!bucketExists) {
    // Create bucket
    const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      fileSizeLimit: 10485760, // 10MB max file size
    });

    if (error) {
      console.error('Failed to create storage bucket:', error);
      throw error;
    }

    console.log(`Created storage bucket: ${STORAGE_BUCKET}`);
  }
}
