import { fetchLogs, createLog, updateLog, deleteLog, fetchLog, fetchLogsWithAfterPhotos, fetchLogsByYearMonth } from "../api/logs";
import { supabase } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// 記録一覧を取得するカスタムフック
export const useFetchLogs = () => {
    return useQuery({
        queryKey: ["logs"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('未ログインです');
            return fetchLogs(user.id);
        },
    });
};

// 特定の記録を取得するカスタムフック
export const useFetchLog = ( id: string ) => {
    return useQuery({
        queryKey: ["log", id],
        queryFn: async () => {
            return fetchLog(id);
        },
    });
};

// 新しい記録を追加するカスタムフック
export function useCreateLog() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createLog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["logs"] });
        },
    });
}

// 既存の記録を更新するカスタムフック
export function useUpdateLog() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateLog,
        onSuccess: () => {
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

// 美容履歴用ログ取得カスタムフック
export const useFetchLogsWithAfterPhotos = () => {
    return useQuery({
        queryKey: ["logs", "afterPhotos"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('未ログインです');
            return fetchLogsWithAfterPhotos(user.id);
        },
        staleTime: 1000 * 60 * 30, // 30分
    });
}

// 特定の年月の記録を取得するカスタムフック
export const useFetchLogsByYearMonth = (year_month: string) => {
    return useQuery({
        queryKey: ["logs", year_month],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('未ログインです');
            return fetchLogsByYearMonth(user.id, year_month);
        },
    });
};
