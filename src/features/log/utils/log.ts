/* ユーティリティ関数 */
import type { Tables } from "@/types/supabase";

type Log = Tables<"logs">;

// 月ごとに記録をグルーピングする
export function groupLogsByMonth(logs: Log[]): [string, Log[]][] {
    const map: Record<string, Log[]> = {};
    for (const log of logs) {
        const key = log.done_at.slice(0, 7); // done_at "2026-04-03" → "2026-04" にする
        if (!map[key]) map[key] = [];
        map[key].push(log);
    }
    // done_at降順で取得済みなので、キーを降順にすればOK
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
}

// カテゴリ別表示順
export const CATEGORY_ORDER = ["hair", "nail", "lash", "esthetic", "medical"] as const;

export const CATEGORY_LABEL: Record<string, string> = {
    hair: "ヘア",
    nail: "ネイル",
    lash: "まつ毛",
    esthetic: "エステ",
    medical: "医療",
};

export const CATEGORY_COLOR: Record<string, string> = {
    hair: "bg-blue-100 text-blue-700",
    nail: "bg-pink-100 text-pink-700",
    lash: "bg-purple-100 text-purple-700",
    esthetic: "bg-green-100 text-green-700",
    medical: "bg-orange-100 text-orange-700",
};

// 月日フォーマットに変換する
export function formatMonthDay(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }); // 例：2026/4/1 → 4/1
}

// 年月日フォーマットに変換する
export function formatFullDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" }); // 例：2026年4月1日
}

// 日本時間の日付でYYYY-MM-DD形式にする
export function formatLocalDate(dateStr: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${dateStr.getFullYear()}-${pad(dateStr.getMonth() + 1)}-${pad(dateStr.getDate())}`;
}
