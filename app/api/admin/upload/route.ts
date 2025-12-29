import { NextResponse } from "next/server";
import { uploadDocumentToStorage, saveDocumentMetadata } from "@/lib/uploads";
import { getCurrentUserWoredaId } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const categoryId = formData.get("category")?.toString();
    const subcategoryCode = formData.get("subcategory")?.toString();
    const year = formData.get("year")?.toString();

    console.log("Upload request received:", {
      hasFile: !!file,
      fileName: file?.name,
      categoryId,
      subcategoryCode,
      year,
    });

    if (!file || !categoryId || !subcategoryCode || !year) {
      return NextResponse.json(
        {
          message: "Missing required upload metadata.",
          details: { hasFile: !!file, categoryId, subcategoryCode, year }
        },
        { status: 422 }
      );
    }

    // Get woreda_id from current user's metadata (Option 2)
    const woredaId = await getCurrentUserWoredaId();
    // Use raw filename for storage key to ensure consistency
    // We will handle URL encoding when generating the public URL
    const safeName = file.name;
    const folderPath = `${woredaId}/${categoryId}/${subcategoryCode}/${year}/${safeName}`;

    console.log("Uploading to Supabase Storage:", folderPath);

    let storageUrl: string;
    try {
      storageUrl = await uploadDocumentToStorage({
        file,
        folderPath,
      });
      console.log("Supabase Storage upload successful:", storageUrl);
    } catch (storageError) {
      console.error("Supabase Storage upload failed:", storageError);
      return NextResponse.json(
        {
          message: "Failed to upload file to storage.",
          error: storageError instanceof Error ? storageError.message : String(storageError)
        },
        { status: 500 }
      );
    }

    try {
      await saveDocumentMetadata({
        categoryId,
        subcategoryCode,
        year,
        fileName: file.name,
        storageUrl,
        uploaderId: "admin",
      });
      console.log("Metadata saved successfully");
    } catch (dbError) {
      console.error("Database save failed:", dbError);
      return NextResponse.json(
        {
          message: "File uploaded but failed to save metadata.",
          error: dbError instanceof Error ? dbError.message : String(dbError)
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Document uploaded successfully." });
  } catch (error) {
    console.error("Upload error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unhandled error while uploading.";
    const stack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        message: `Upload failed: ${message}`,
        error: message,
        stack: process.env.NODE_ENV === "development" ? stack : undefined
      },
      { status: 500 }
    );
  }
}


