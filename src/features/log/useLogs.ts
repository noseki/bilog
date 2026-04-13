import { fetchLogs, createLog, deleteLog } from "@/api/logs";
import { supabase } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

// 新しい記録を追加するカスタムフック
export function useCreateLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createLog,
        onSuccess: () => {
            // 商品が作成された後、"logs" で始まるすべてのクエリキーを無効化して記録一覧を再取得
            queryClient.invalidateQueries({ queryKey: ["logs"] });
        },
    });
}

// 記録を削除するカスタムフック
export function useDeleteLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteLog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["logs"] });
        },
    });
}
