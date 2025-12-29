import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const documentId = searchParams.get("id");

        if (!documentId) {
            return NextResponse.json(
                { error: "Document ID is required" },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdminClient();

        // Get document details first
        const { data: document, error: fetchError } = await supabase
            .from("uploads")
            .select("*")
            .eq("id", documentId)
            .single();

        if (fetchError || !document) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 }
            );
        }

        // Delete from Supabase Storage
        try {
            // Extract the file path from the storage URL
            // Supabase Storage URL format: https://{project}.supabase.co/storage/v1/object/public/documents/{path}
            const storageUrl = document.storage_url;
            const urlObj = new URL(storageUrl);
            
            // Extract path after /public/documents/
            const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/documents\/(.+)$/);
            if (pathMatch && pathMatch[1]) {
                const filePath = decodeURIComponent(pathMatch[1]);
                
                const { error: storageError } = await supabase
                    .storage
                    .from('documents')
                    .remove([filePath]);

                if (storageError) {
                    console.error("Error deleting from Supabase Storage:", storageError);
                    // Continue with database deletion even if storage deletion fails
                } else {
                    console.log("Successfully deleted file from Supabase Storage:", filePath);
                }
            } else {
                console.warn("Could not extract file path from storage URL:", storageUrl);
            }
        } catch (storageError) {
            console.error("Error deleting from Supabase Storage:", storageError);
            // Continue with database deletion even if storage deletion fails
        }

        // Delete from database
        const { error: deleteError } = await supabase
            .from("uploads")
            .delete()
            .eq("id", documentId);

        if (deleteError) {
            return NextResponse.json(
                { error: "Failed to delete document from database" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in delete document route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
