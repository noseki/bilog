import { budgetSchema } from "@/features/budget/schema";
import { describe, test, expect } from "vitest";

describe("budgetSchema", () => {
    const validBase = {
        year_month: "2026-04",
        amount: 10000
    };

    test("正常データはバリデーションを通る", () => {
        expect(budgetSchema.safeParse(validBase).success).toBe(true);
    });

    test("対象年月がundefinedでエラーになる", () => {
        const result = budgetSchema.safeParse({ ...validBase, year_month: "" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("年月を選択してください");
    });

    test("予算額が空でエラーになる", () => {
        const result = budgetSchema.safeParse({ ...validBase, amount: "" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("予算額を入力してください");
    });

    test("予算額が小数でエラーになる", () => {
        const result = budgetSchema.safeParse({ ...validBase, amount: 1.5 });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("整数で入力してください");
    });

    test("予算額が負数でエラーになる", () => {
        const result = budgetSchema.safeParse({ ...validBase, amount: -1 });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("0以上の予算額を入力してください");
    });
});
