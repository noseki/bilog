import { fetchLogs } from "@/api/logs";
import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

//　記録一覧を取得するカスタムフック
export const useLogs = () => {
    return useQuery({
        queryKey: ["logs"],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('未ログインです');
            return fetchLogs(session.user.id);
        },
    });
};
