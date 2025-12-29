import { NextResponse } from "next/server";
import { validateTemporaryAccess } from "@/lib/access";
import { getDocumentsForWoreda } from "@/lib/uploads";

/**
 * This endpoint validates access and returns the direct R2 public URL
 * for Office documents. Microsoft Office Online Viewer requires a publicly
 * accessible URL, so we can't use our authenticated proxy.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get("url");
    const token = searchParams.get("token");

    if (!fileUrl || !token) {
      return NextResponse.json(
        { error: "File URL and token are required." },
        { status: 400 }
      );
    }

    // Validate the temporary access token
    const accessRecord = await validateTemporaryAccess(token);
    if (!accessRecord) {
      return NextResponse.json(
        { error: "Invalid or expired access token." },
        { status: 401 }
      );
    }

    // Verify the file belongs to the user's woreda
    const documents = await getDocumentsForWoreda(accessRecord.woreda_id);
    const document = documents.find((doc) => doc.storage_url === fileUrl);

    if (!document) {
      return NextResponse.json(
        { error: "File not found or access denied." },
        { status: 404 }
      );
    }

    // Supabase Storage URLs are already public URLs
    const publicUrl = fileUrl;

    // Final accessibility check (to set the flag for the client)
    let isAccessible = false;
    let accessibilityError: string | null = null;

    try {
      const testResponse = await fetch(publicUrl, {
        method: "HEAD",
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(5000),
      });

      if (!testResponse.ok) {
        console.warn("⚠️ Public URL HEAD check failed, but returning as accessible to let client try.");
        console.warn("   URL:", publicUrl);
        console.warn("   Status:", testResponse.status, testResponse.statusText);
        isAccessible = true; // Force true to allow client to try
      } else {
        isAccessible = true;
      }
    } catch (testError: any) {
      console.warn("⚠️ Public URL check error (network/timeout), returning as accessible to let client try.");
      console.warn("   Error:", testError.message);
      isAccessible = true; // Force true to allow client to try
    }

    // Return the public URL with accessibility status
    return NextResponse.json({
      publicUrl: publicUrl,
      fileName: document.file_name,
      isAccessible: isAccessible,
      error: accessibilityError,
      message: null
    });

  } catch (error) {
    console.error("Error in get-public-file-url route:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
