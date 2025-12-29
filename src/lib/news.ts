
import { getSupabaseServerClient, getCurrentUserWoredaId } from "./supabaseServer";
import { publicEnv, requiredEnv } from "./env";
import type { NewsRecord } from "@/types";

/**
 * Fetch published news for public display
 */
export async function getNews(limit = 6): Promise<NewsRecord[]> {
    const supabase = await getSupabaseServerClient();
    const woredaId = publicEnv.NEXT_PUBLIC_WOREDA_ID;
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/fc0a35e4-d777-4627-b1d5-a657a6abd381',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/lib/news.ts:11',message:'getNews called',data:{woredaId,limit},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("woreda_id", woredaId)
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(limit);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/fc0a35e4-d777-4627-b1d5-a657a6abd381',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/lib/news.ts:20',message:'News query result',data:{hasError:!!error,errorMessage:error?.message,dataCount:data?.length,firstItemWoredaId:data?.[0]?.woreda_id,firstItemPublished:data?.[0]?.published,allWoredaIds:data?.map((d:any)=>d.woreda_id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,D'})}).catch(()=>{});
    // #endregion

    if (error) {
        console.error("Error fetching news:", error);
        return [];
    }

    return (data as NewsRecord[]) || [];
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

    return (data as NewsRecord[]) || [];
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

    return (data as NewsRecord) || null;
}
