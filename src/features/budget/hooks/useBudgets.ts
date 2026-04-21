import { supabase } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBudget, deleteBudget, fetchBudgetById, fetchBudgetByYearMonth, fetchBudgets, updateBudget } from "../api/budgets";

// 予算一覧を取得するカスタムフック
export const useFetchBudgets = () => {
    return useQuery({
        queryKey: ["budgets"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('未ログインです');
            return fetchBudgets(user.id);
        },
    });
};

// 特定の予算をyear_monthから取得するカスタムフック
export const useFetchBudgetByYearMonth = ( year_month: string ) => {
    return useQuery({
        queryKey: ["budgets", year_month],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('未ログインです');
            return fetchBudgetByYearMonth(user.id, year_month);
        },
    });
};

// 特定の予算をidから取得するカスタムフック
export const useFetchBudgetById = ( id: string ) => {
    return useQuery({
        queryKey: ["budgets", id],
        queryFn: async () => {
            return fetchBudgetById( id);
        },
    });
};

// 新しい予算を追加するカスタムフック
export function useCreateBudget() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createBudget,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
        },
    });
}

// 既存の予算を更新するカスタムフック
export function useUpdateBudget() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateBudget,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
        },
    });
}

// 予算を削除するカスタムフック
export function useDeleteBudget() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteBudget,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
        },
    });
}
