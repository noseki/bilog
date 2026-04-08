import { supabase } from "../lib/supabase/client";

export const fetchLogs = async (userId: string) => {
    const { data, error } = await supabase
        .from("logs")
        .select("*")
        .eq("user_id", userId)
        .order("done_at", { ascending: false }) // 最新順
        .order("created_at", { ascending: false });

    if (error) throw new Error(`fetchLogs error: ${error.message}`);
    return data;
};
