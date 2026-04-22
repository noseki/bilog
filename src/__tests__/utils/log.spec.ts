import { formatFullDate, formatLocalDate, formatMonthDay, groupLogsByMonth } from "@/features/log/utils/log";
import type { Tables } from "@/types/supabase";

type Log = Tables<"logs">;

describe("groupLogsByMonth", () => {
    test("同じ月の記録がまとめられる", () => {
        const logs = [
            { done_at: "2026-04-15", id: "1" },
            { done_at: "2026-04-01", id: "2" },
            { done_at: "2026-03-20", id: "3" },
        ] as Log[];

        const result = groupLogsByMonth(logs);
        expect(result[0][0]).toBe("2026-04");
        expect(result[0][1]).toHaveLength(2);
        expect(result[1][0]).toBe("2026-03");
    })

    test("空配列のとき空配列を返す", () => {
        expect(groupLogsByMonth([])).toEqual([]);
    });

    test("降順にソートされる", () => {
        const logs = [
            { done_at: "2026-03-01", id: "1" },
            { done_at: "2026-05-01", id: "2" },
            { done_at: "2026-04-01", id: "3" },
        ] as Log[];

        const [first, , last] = groupLogsByMonth(logs);
        expect(first[0]).toBe("2026-05");
        expect(last[0]).toBe("2026-03");
    });
});

describe("formatMonthDay", () => {
    test("YYYY-MM-DD → 月日に変換される", () => {
        expect(formatMonthDay("2026-04-01")).toBe("4/1");
    })
});

describe("formatFullDate", () => {
    test("YYYY-MM-DD → 日本語の年月日に変換される", () => {
        expect(formatFullDate("2026-04-01")).toBe("2026年4月1日");
    });
});

describe("formatLocalDate", () => {
    test("Dateオブジェクト → YYYY-MM-DD形式になる", () => {
      expect(formatLocalDate(new Date(2026, 3, 1))).toBe("2026-04-01"); // 月は0始まり
    });
});
