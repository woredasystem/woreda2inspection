
import { getSupabaseServerClient, getCurrentUserWoredaId } from "./supabaseServer";
import { publicEnv, requiredEnv } from "./env";
import type { NewsRecord, NewsPhotoRecord } from "@/types";
import { getNewsPhotos } from "./news-actions";

/**
 * Fetch published news for public display
 */
export async function getNews(limit = 6): Promise<NewsRecord[]> {
    const supabase = await getSupabaseServerClient();
    const woredaId = publicEnv.NEXT_PUBLIC_WOREDA_ID;

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/fc0a35e4-d777-4627-b1d5-a657a6abd381', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'pre-fix',
            hypothesisId: 'H1',
            location: 'src/lib/news.ts:getNews:entry',
            message: 'getNews called',
            data: { limit, woredaId },
            timestamp: Date.now()
        })
    }).catch(() => { });
    // #endregion

    const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("woreda_id", woredaId)
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(limit);

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/fc0a35e4-d777-4627-b1d5-a657a6abd381', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'pre-fix',
            hypothesisId: 'H2',
            location: 'src/lib/news.ts:getNews:after-query',
            message: 'getNews query result',
            data: {
                woredaId,
                hasError: !!error,
                errorMessage: error?.message ?? null,
                rowCount: Array.isArray(data) ? data.length : null
            },
            timestamp: Date.now()
        })
    }).catch(() => { });
    // #endregion

    if (error) {
        console.error("Error fetching news:", error);
        return [];
    }

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/fc0a35e4-d777-4627-b1d5-a657a6abd381', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'pre-fix',
            hypothesisId: 'H3',
            location: 'src/lib/news.ts:getNews:exit',
            message: 'getNews returning data',
            data: {
                woredaId,
                returnedCount: Array.isArray(data) ? data.length : null
            },
            timestamp: Date.now()
        })
    }).catch(() => { });
    // #endregion

    // Fetch photos for each news item
    const newsWithPhotos = await Promise.all(
        (data || []).map(async (item: NewsRecord) => {
            const photos = await getNewsPhotos(item.id);
            return { ...item, photos };
        })
    );

    return newsWithPhotos as NewsRecord[];
}

/**
 * Fetch all news for admin display
 */
export async function getAllNews(): Promise<NewsRecord[]> {
    const supabase = await getSupabaseServerClient();
    const woredaId = await getCurrentUserWoredaId();
    console.log("getAllNews - WoredaID:", woredaId);

    const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("woreda_id", woredaId)
        .order("created_at", { ascending: false });

    console.log("getAllNews - Data length:", data?.length);
    console.log("getAllNews - Error:", error);

    if (error) {
        console.error("Error fetching admin news:", error);
        return [];
    }

    // Fetch photos for each news item
    const newsWithPhotos = await Promise.all(
        (data || []).map(async (item: NewsRecord) => {
            const photos = await getNewsPhotos(item.id);
            return { ...item, photos };
        })
    );

    return newsWithPhotos as NewsRecord[];
}

/**
 * Fetch a single news item by ID
 */
export async function getNewsItem(id: string): Promise<NewsRecord | null> {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        // console.error("Error fetching news item:", error); 
        // Quietly fail for 404s
        return null;
    }

    if (!data) return null;

    // Fetch photos for this news item
    const photos = await getNewsPhotos(id);

    return { ...(data as NewsRecord), photos };
}
