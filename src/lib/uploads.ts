import { getSupabaseServerClient } from "./supabaseServer";
import type { DocumentUploadRecord } from "@/types";

export async function uploadDocumentToStorage(args: {
  folderPath: string;
  file: File;
}): Promise<string> {
  try {
    const supabase = await getSupabaseServerClient();

    console.log("Uploading to Supabase Storage:", {
      bucket: 'documents',
      folderPath: args.folderPath,
      fileName: args.file.name,
      fileSize: args.file.size,
    });

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('documents')
      .upload(args.folderPath, args.file, {
        contentType: args.file.type || "application/octet-stream",
        upsert: false, // Don't overwrite existing files
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    if (!uploadData) {
      throw new Error("Upload succeeded but no data returned");
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('documents')
      .getPublicUrl(args.folderPath);

    console.log("Supabase Storage upload successful, returning public URL:", publicUrl);

    return publicUrl;
  } catch (error) {
    console.error("uploadDocumentToStorage error:", error);
    throw error;
  }
}

import { getCurrentUserWoredaId } from "./supabaseServer";

export async function saveDocumentMetadata(args: {
  categoryId: string;
  subcategoryCode: string;
  year: string;
  fileName: string;
  storageUrl: string;
  uploaderId: string;
}): Promise<DocumentUploadRecord> {
  // Get woreda_id from current user's metadata (Option 2)
  const woredaId = await getCurrentUserWoredaId();
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("uploads")
    .insert({
      woreda_id: woredaId,
      category_id: args.categoryId,
      subcategory_code: args.subcategoryCode,
      year: args.year,
      file_name: args.fileName,
      storage_url: args.storageUrl,
      uploader_id: args.uploaderId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save metadata: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to save metadata: No data returned from database.");
  }

  return data;
}

export async function getDocumentsForWoreda(
  woredaId: string
): Promise<DocumentUploadRecord[]> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("uploads")
    .select("*")
    .eq("woreda_id", woredaId)
    .order("year", { ascending: false })
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getDocumentsForCurrentWoreda(): Promise<DocumentUploadRecord[]> {
  // Get woreda_id from current user's metadata (Option 2)
  const woredaId = await getCurrentUserWoredaId();
  return getDocumentsForWoreda(woredaId);
}

