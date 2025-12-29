import { NextRequest, NextResponse } from "next/server";
import { validateTemporaryAccess } from "@/lib/access";
import { getDocumentsForWoreda } from "@/lib/uploads";

export async function GET(request: NextRequest) {
  try {
    // Get token from query params
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");
    const fileUrl = searchParams.get("url");

    if (!token || !fileUrl) {
      return NextResponse.json(
        { error: "Token and file URL are required." },
        { status: 400 }
      );
    }

    // Validate temporary access
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

    // Fetch file from Supabase Storage
    try {
      const fileResponse = await fetch(fileUrl, {
        method: "GET",
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      if (!fileResponse.ok) {
        return NextResponse.json(
          { error: "File not found." },
          { status: 404 }
        );
      }

      const fileBuffer = await fileResponse.arrayBuffer();
      const contentType = fileResponse.headers.get("content-type") || "application/octet-stream";
      const fileName = document.file_name;

      // Return file with appropriate headers
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${fileName}"`,
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
        },
      });
    } catch (fetchError) {
      console.error("Error fetching file from Supabase Storage:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch file from storage." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to serve file",
      },
      { status: 500 }
    );
  }
}

