/**
 * imageUpload.ts
 * Utility: Kompres gambar di sisi klien lalu upload ke Supabase Storage.
 * - Kompres ke WebP/JPEG max 200KB menggunakan browser-image-compression
 * - Upload ke bucket "avatars" di Supabase Storage
 * - Return public URL (bukan Base64)
 */

import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

export interface UploadResult {
  url: string;
  error?: never;
}

export interface UploadError {
  url?: never;
  error: string;
}

export type ImageUploadResult = UploadResult | UploadError;

/**
 * Kompres + upload gambar ke Supabase Storage.
 * @param file - File gambar yang dipilih user dari <input type="file">
 * @param folder - Sub-folder di dalam bucket (default: "avatars")
 * @returns Public URL gambar, atau object error
 */
export async function uploadImage(
  file: File,
  folder: string = "avatars"
): Promise<ImageUploadResult> {
  try {
    // 1. Kompres di sisi klien
    const compressionOptions = {
      maxSizeMB: 0.2,           // Maks 200KB
      maxWidthOrHeight: 800,    // Resize jika lebih besar dari 800px
      useWebWorker: true,       // Non-blocking compression
      fileType: "image/webp",   // Output WebP
      initialQuality: 0.8,
    };

    const compressedFile = await imageCompression(file, compressionOptions);

    // 2. Generate nama file unik agar tidak terjadi overwrite
    const fileExt = "webp";
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${folder}/${timestamp}-${randomStr}.${fileExt}`;

    // 3. Upload ke Supabase Storage
    const supabase = createClient();
    const { data, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, compressedFile, {
        contentType: "image/webp",
        upsert: false,
      });

    if (uploadError) {
      return { error: `Gagal upload: ${uploadError.message}` };
    }

    // 4. Dapatkan public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(data.path);

    if (!urlData?.publicUrl) {
      return { error: "Gagal mendapatkan URL gambar" };
    }

    return { url: urlData.publicUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return { error: `Gagal memproses gambar: ${message}` };
  }
}
