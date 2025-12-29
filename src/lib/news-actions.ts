"use server";

import { getSupabaseServerClient, getCurrentUserWoredaId } from "./supabaseServer";
import type { NewsRecord } from "@/types";

/**
 * Create a new news item
 */
export async function createNewsItem(args: {
    title: string;
    content: string;
    summary?: string;
    cover_image_url?: string;
    youtube_url?: string;
    published: boolean;
}): Promise<NewsRecord | null> {
    const supabase = await getSupabaseServerClient();
    const woredaId = await getCurrentUserWoredaId();

    const { data, error } = await supabase
        .from("news")
        .insert({
            woreda_id: woredaId,
            title: args.title,
            content: args.content,
            summary: args.summary,
            cover_image_url: args.cover_image_url,
            youtube_url: args.youtube_url,
            published: args.published,
            published_at: args.published ? new Date().toISOString() : null,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating news:", error);
        throw new Error(error.message);
    }

    return (data as NewsRecord) || null;
}

/**
 * Update a news item
 */
export async function updateNewsItem(
    id: string,
    args: {
        title: string;
        content: string;
        summary?: string;
        cover_image_url?: string;
        youtube_url?: string;
        published?: boolean;
    }
): Promise<NewsRecord | null> {
    const supabase = await getSupabaseServerClient();

    const updates: any = {
        title: args.title,
        content: args.content,
        summary: args.summary,
        cover_image_url: args.cover_image_url,
        youtube_url: args.youtube_url,
        updated_at: new Date().toISOString(),
    };

    if (args.published !== undefined) {
        updates.published = args.published;
        if (args.published) {
            updates.published_at = new Date().toISOString();
        } else {
            updates.published_at = null;
        }
    }

    const { data, error } = await supabase
        .from("news")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating news:", error);
        throw new Error(error.message);
    }

    return (data as NewsRecord) || null;
}

/**
 * Delete a news item
 */
export async function deleteNewsItem(id: string): Promise<boolean> {
    const supabase = await getSupabaseServerClient();

    const { error } = await supabase
        .from("news")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting news:", error);
        throw new Error(error.message);
    }

    return true;
}

/**
 * Upload news image to Supabase Storage
 */
export async function uploadNewsImage(file: File): Promise<string> {
    const supabase = await getSupabaseServerClient();
    const woredaId = await getCurrentUserWoredaId();

    // Create a unique file path: woreda_id/timestamp-filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${woredaId}/${fileName}`;

    const { error: uploadError } = await supabase
        .storage
        .from('news')
        .upload(filePath, file);

    if (uploadError) {
        console.error("Error uploading image:", uploadError);
        throw new Error(uploadError.message);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
        .storage
        .from('news')
        .getPublicUrl(filePath);

    return publicUrl;
}

/**
 * Upload multiple news images to Supabase Storage
 */
export async function uploadNewsImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => uploadNewsImage(file));
    return Promise.all(uploadPromises);
}
