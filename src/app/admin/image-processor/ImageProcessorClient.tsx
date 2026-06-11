"use client";

import { useState } from "react";

interface ProcessedImage {
  id: string;
  product_id: string;
  original_url: string;
  processed_data: string;
  status: string;
  processing_metadata: unknown;
  created_at: string;
}

interface ImageProcessorClientProps {
  initialPendingImages: ProcessedImage[];
}

export function ImageProcessorClient({
  initialPendingImages,
}: ImageProcessorClientProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [style, setStyle] = useState("brown-gradient");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sdServerStatus, setSdServerStatus] = useState<boolean | null>(null);
  const [pendingImages] = useState(initialPendingImages);

  const checkSDServer = async () => {
    try {
      const response = await fetch("/api/admin/process-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ check_health: true }),
      });
      setSdServerStatus(response.ok);
    } catch {
      setSdServerStatus(false);
    }
  };

  const processImage = async () => {
    if (!imageUrl.trim()) {
      setError("Please enter an image URL");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessedImage(null);

    try {
      const response = await fetch("/api/admin/process-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: imageUrl,
          style,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Processing failed");
      }

      const data = await response.json();
      setProcessedImage(data.processed_image);

      // Refresh pending images
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const approveImage = async (id: string) => {
    // TODO: Implement approval logic
    console.log("Approve:", id);
  };

  const rejectImage = async (id: string) => {
    // TODO: Implement rejection logic
    console.log("Reject:", id);
  };

  return (
    <div className="space-y-8">
      {/* SD Server Status */}
      <div className="bg-background-card rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">SD Server Status</h3>
            <p className="text-sm text-text-muted">
              Local Stable Diffusion must be running
            </p>
          </div>
          <button
            onClick={checkSDServer}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
          >
            Check Status
          </button>
        </div>
        {sdServerStatus !== null && (
          <div className="mt-3 flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                sdServerStatus ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm">
              {sdServerStatus
                ? "Connected (localhost:5001)"
                : "Not Connected - Start Python server"}
            </span>
          </div>
        )}
      </div>

      {/* Process New Image */}
      <div className="bg-background-card rounded-lg p-6 border border-white/10">
        <h2 className="text-xl font-bold mb-4">Process New Image</h2>

        <div className="space-y-4">
          {/* Image URL Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Image URL
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/product.jpg"
              className="w-full bg-background-secondary border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
            />
          </div>

          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Background Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-background-secondary border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
            >
              <option value="brown-gradient">Brown Gradient (#85572A)</option>
              <option value="minimal-white">Minimal White</option>
              <option value="custom">Custom Prompt</option>
            </select>
          </div>

          {/* Process Button */}
          <button
            onClick={processImage}
            disabled={isProcessing || !imageUrl.trim()}
            className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚙️</span>
                Processing...
              </span>
            ) : (
              "Process Image"
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Result Display */}
          {processedImage && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Processed Result</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-muted mb-2">Original</p>
                  <img
                    src={imageUrl}
                    alt="Original"
                    className="w-full rounded-lg border border-white/10"
                  />
                </div>
                <div>
                  <p className="text-sm text-text-muted mb-2">Processed</p>
                  <img
                    src={processedImage}
                    alt="Processed"
                    className="w-full rounded-lg border border-primary/50"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pending Review Queue */}
      <div className="bg-background-card rounded-lg p-6 border border-white/10">
        <h2 className="text-xl font-bold mb-4">
          Pending Review ({pendingImages.length})
        </h2>

        {pendingImages.length === 0 ? (
          <p className="text-text-muted text-center py-8">
            No images pending review
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingImages.map((img) => (
              <div
                key={img.id}
                className="bg-background-secondary rounded-lg p-4 border border-white/10"
              >
                <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-background-dark">
                  <img
                    src={img.processed_data}
                    alt="Processed"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveImage(img.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => rejectImage(img.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    ✗ Reject
                  </button>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  {new Date(img.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-amber-600/10 border border-amber-600/20 rounded-lg p-6">
        <h3 className="font-bold mb-2 text-amber-400">📋 Setup Instructions</h3>
        <ol className="space-y-2 text-sm text-amber-200/80">
          <li>1. Install Stable Diffusion (A1111 or ComfyUI)</li>
          <li>2. Run: <code className="bg-black/30 px-2 py-0.5 rounded">cd sd-processor && python server.py</code></li>
          <li>3. Ensure SD is running with API enabled</li>
          <li>4. Process images and review results</li>
        </ol>
      </div>
    </div>
  );
}
