/* ユーティリティ関数 */
import type { Tables } from "@/types/supabase";

type Log = Tables<"logs">;

// 月ごとに記録をグルーピングする
export function groupLogsByMonth(logs: Log[]): [string, Log[]][] {
    const map: Record<string, Log[]> = {};
    for (const log of logs) {
        const key = log.done_at.slice(0, 7); // "2025-12"
        if (!map[key]) map[key] = [];
        map[key].push(log);
    }
    // done_at降順で取得済みなので、キーを降順にすればOK
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
}

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
