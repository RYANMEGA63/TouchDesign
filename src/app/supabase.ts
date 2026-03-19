// ── Supabase Client ──────────────────────────────────────────────
// Configure avec tes variables d'environnement dans .env :
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJ...

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[Supabase] Variables manquantes. Crée un fichier .env avec :\n" +
    "  VITE_SUPABASE_URL=https://xxxx.supabase.co\n" +
    "  VITE_SUPABASE_ANON_KEY=eyJ..."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// ── Storage helpers ──────────────────────────────────────────────
// Upload une image (File ou dataURL) dans le bucket Supabase Storage
// Retourne l'URL publique ou null en cas d'erreur

export async function uploadImage(
  bucket: "products" | "custom-orders" | "realisations",
  path: string,
  fileOrDataUrl: File | string
): Promise<string | null> {
  let file: File;

  if (typeof fileOrDataUrl === "string") {
    // Convert data URL to File
    const res = await fetch(fileOrDataUrl);
    const blob = await res.blob();
    const ext = blob.type.split("/")[1] ?? "jpg";
    file = new File([blob], `${path}.${ext}`, { type: blob.type });
  } else {
    file = fileOrDataUrl;
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const fullPath = `${path}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fullPath, file, { upsert: true });

  if (error) { console.error("[Storage] Upload error:", error); return null; }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fullPath);
  return data.publicUrl;
}

export async function deleteImage(
  bucket: "products" | "custom-orders" | "realisations",
  path: string
): Promise<void> {
  await supabase.storage.from(bucket).remove([path]);
}
