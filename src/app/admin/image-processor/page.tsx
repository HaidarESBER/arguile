import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ImageProcessorClient } from "./ImageProcessorClient";

export const metadata = {
  title: "Image Processor - Admin",
  description: "Process product images with AI",
};

export default async function ImageProcessorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  // Fetch pending processed images
  const { data: pendingImages } = await supabase
    .from("processed_images")
    .select("*")
    .eq("status", "pending_review")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-background-dark text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Image Processor</h1>
          <p className="text-text-muted">
            Process product images with local Stable Diffusion
          </p>
        </div>

        <ImageProcessorClient initialPendingImages={pendingImages || []} />
      </div>
    </div>
  );
}
