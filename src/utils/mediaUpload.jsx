import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, anonKey);

export default async function mediaUpload(file) {
  if (!file) {
    throw new Error("No file selected");
  }

  const timestamp = new Date().getTime();
  const fileName = `${timestamp}_${file.name.replace(/\s+/g, "_")}`;

  // 1. Upload to Supabase 'products' bucket
  const { data, error } = await supabase.storage
    .from("products")
    .upload(fileName, file, {
      upsert: false,
      cacheControl: "3600"
    });

  if (error) {
    console.error("Supabase Upload Error:", error);
    throw new Error(error.message || "Failed to upload image");
  }

  // 2. Fetch the public URL directly
  const { data: urlData } = supabase.storage
    .from("products")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}