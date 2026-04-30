import { supabase } from "@/lib/supabase/client";

import type { Tables } from "@/types/supabase";
import type { budgetValues } from "../schema";

type Budget = Tables<"budgets">;

export const fetchBudgets = async (userId: string) => {
    const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", userId)
        .order("year_month", { ascending: false }); // 最新順

    if (error) throw new Error(`fetchBudgets error: ${error.message}`);
    return data;
};

export const fetchBudgetByYearMonth = async (userId: string, year_month: string): Promise<Budget | null> => {
    const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", userId)
        .eq("year_month", year_month)
        .maybeSingle();

    if (error) throw new Error(`fetchBudgetByYearMonth error: ${error.message}`);
    return data;
};

export const fetchBudgetById = async (id: string): Promise<Budget> => {
    const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw new Error(`fetchBudgetById error: ${error.message}`);
    return data;
};

export const createBudget = async ({
    userId,
    formData,
}: {
    userId: string,
    formData: budgetValues
}): Promise<Budget> => {
    const { data, error } = await supabase
        .from("budgets")
        .insert({
            user_id: userId,
            year_month: formData.year_month,
            amount: formData.amount,
        })
        .select()
        .single();

    if (error) {
        if (error.code === "23505") throw new Error("DUPLICATE_YEAR_MONTH"); // 対象年月が重複している場合（一意性制約違反）
        throw new Error(`createBudget error: ${error.message}`);
    }
    return data;
};

export const updateBudget = async ({
    id,
    amount
}: {
    id: string,
    amount: number,
}): Promise<Budget> => {
    const { data, error } = await supabase
        .from("budgets")
        .update({
            amount: amount,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw new Error(`updateBudget error: ${error.message}`);
    return data;
};

export const deleteBudget = async (id: string) => {
    const { error } = await supabase.from("budgets").delete().eq("id", id);

    if (error) throw new Error(`deleteBudget error: ${error.message}`);
};
