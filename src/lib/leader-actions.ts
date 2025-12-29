"use server";

import { getSupabaseServerClient, getCurrentUserWoredaId } from "./supabaseServer";
import { publicEnv } from "./env";
import type { LeaderRecord } from "@/types";

/**
 * Fetch all leaders for public display
 */
export async function getLeaders(): Promise<LeaderRecord[]> {
    const supabase = await getSupabaseServerClient();
    const woredaId = publicEnv.NEXT_PUBLIC_WOREDA_ID;
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/fc0a35e4-d777-4627-b1d5-a657a6abd381',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/lib/leader-actions.ts:12',message:'getLeaders called',data:{woredaId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    const { data, error } = await supabase
        .from("leaders")
        .select("*")
        .eq("woreda_id", woredaId)
        .order("sort_order", { ascending: true });
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/fc0a35e4-d777-4627-b1d5-a657a6abd381',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/lib/leader-actions.ts:19',message:'Leaders query result',data:{hasError:!!error,errorMessage:error?.message,dataCount:data?.length,firstItemWoredaId:data?.[0]?.woreda_id,allWoredaIds:data?.map((d:any)=>d.woreda_id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,D'})}).catch(()=>{});
    // #endregion

    if (error) {
        console.error("Error fetching leaders:", error);
        return [];
    }

    return (data as LeaderRecord[]) || [];
}

/**
 * Fetch all leaders for admin (same as public but might differ in future)
 */
export async function getAdminLeaders(): Promise<LeaderRecord[]> {
    const supabase = await getSupabaseServerClient();
    const woredaId = await getCurrentUserWoredaId();

    const { data, error } = await supabase
        .from("leaders")
        .select("*")
        .eq("woreda_id", woredaId)
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true });

    if (error) {
        console.error("Error fetching admin leaders:", error);
        return [];
    }

    return (data as LeaderRecord[]) || [];
}

/**
 * Get a single leader
 */
export async function getLeader(id: string): Promise<LeaderRecord | null> {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
        .from("leaders")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return null;
    }

    return (data as LeaderRecord) || null;
}

/**
 * Create a leader
 */
export async function createLeader(args: Omit<LeaderRecord, "id" | "created_at" | "updated_at" | "woreda_id">): Promise<LeaderRecord | null> {
    const supabase = await getSupabaseServerClient();
    const woredaId = await getCurrentUserWoredaId();

    const { data, error } = await supabase
        .from("leaders")
        .insert({
            woreda_id: woredaId,
            ...args
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating leader:", error);
        throw new Error(error.message);
    }

    return (data as LeaderRecord) || null;
}

/**
 * Update a leader
 */
export async function updateLeader(
    id: string,
    args: Partial<Omit<LeaderRecord, "id" | "created_at" | "updated_at" | "woreda_id">>
): Promise<LeaderRecord | null> {
    const supabase = await getSupabaseServerClient();

    const updates = {
        ...args,
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from("leaders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating leader:", error);
        throw new Error(error.message);
    }

    return (data as LeaderRecord) || null;
}

/**
 * Delete a leader
 */
export async function deleteLeader(id: string): Promise<boolean> {
    const supabase = await getSupabaseServerClient();

    const { error } = await supabase
        .from("leaders")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting leader:", error);
        throw new Error(error.message);
    }

    return true;
}

/**
 * Upload leader image
 */
export async function uploadLeaderImage(file: File): Promise<string> {
    const supabase = await getSupabaseServerClient();
    const woredaId = await getCurrentUserWoredaId();

    // Create a unique file path: woreda_id/leaders-timestamp-filename
    const fileExt = file.name.split('.').pop();
    const fileName = `leaders-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${woredaId}/${fileName}`;

    // Check if bucket exists by trying to list it
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
        console.error("Error listing buckets:", bucketError);
        throw new Error(`Failed to access storage: ${bucketError.message}`);
    }

    const newsBucket = buckets?.find(b => b.name === 'news');
    if (!newsBucket) {
        throw new Error(
            "Storage bucket 'news' does not exist. " +
            "Please create a public bucket named 'news' in your Supabase Storage settings."
        );
    }

    const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('news') // Reuse 'news' bucket
        .upload(filePath, file, {
            contentType: file.type || 'image/jpeg',
            upsert: false,
        });

    if (uploadError) {
        console.error("Error uploading image:", uploadError);
        if (uploadError.message.includes('Bucket not found')) {
            throw new Error(
                "Storage bucket 'news' not found. " +
                "Please create a public bucket named 'news' in your Supabase Storage settings."
            );
        }
        throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    if (!uploadData) {
        throw new Error("Upload succeeded but no data returned");
    }

    const { data: { publicUrl } } = supabase
        .storage
        .from('news')
        .getPublicUrl(filePath);

    // Verify the URL is valid
    if (!publicUrl) {
        throw new Error("Failed to generate public URL for uploaded image");
    }

    return publicUrl;
}
