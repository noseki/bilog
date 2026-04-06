import { supabase } from "../lib/supabase/client";

export const fetchLogs = async (userId: string) => {
    const { data, error } = await supabase
        .from("logs")
        .select("*")
        .eq("user_id", userId)
        .order("done_at", { ascending: false });
console.table(data);
    if (error) throw new Error(`fetchLogs error: ${error.message}`);
    return data;
};
