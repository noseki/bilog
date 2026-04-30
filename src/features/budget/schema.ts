import { z } from "zod";

export const budgetSchema = z.object({
    year_month: z.string().min(1, { message: "年月を選択してください" }),
    amount: z.number({ error: "予算額を入力してください" }).int('整数で入力してください').min(0, { message: "0以上の予算額を入力してください" })
});

export type budgetValues = z.infer<typeof budgetSchema>;
