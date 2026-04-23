import { useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useFetchBudgetByYearMonth } from "@/features/budget/hooks/useBudgets";
import { useFetchLogsByYearMonth } from "@/features/log/hooks/useLogs";
import { CATEGORY_LABEL } from "@/features/log/utils/log";

const CHART_COLORS: Record<string, string> = {
    hair: "#60a5fa",
    nail: "#f472b6",
    lash: "#c084fc",
    esthetic: "#4ade80",
    medical: "#fb923c",
};

export const BudgetSummary = () => {
    const currentMonth = format(new Date(), "yyyy-MM");
    const { data: logs, isLoading: logsLoading } = useFetchLogsByYearMonth(currentMonth);
    const { data: budget, isLoading: budgetLoading } = useFetchBudgetByYearMonth(currentMonth);

    const usedAmount = logs?.reduce((sum, log) => sum + log.cost, 0) ?? 0; // 使用額
    const remaining = budget ? budget.amount - usedAmount : 0;  // 残り使用可能額
    const isOver = budget ? remaining < 0 : false; // 予算オーバーフラグ

    const categoryData = Object.entries(
        logs?.reduce<Record<string, number>>((acc, log) => {
            acc[log.category] = (acc[log.category] ?? 0) + log.cost;
            return acc;
        }, {}) ?? {}
    )
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
        name,
        value,
        fill: CHART_COLORS[name] ?? "#e5e7eb",
    }))
    .sort((a, b) => b.value - a.value);

    // 予算超過トースト表示
    useEffect(() => {
        if (!budget) return;

        const storageKey = `budget-notified-${currentMonth}`;

        if (!isOver) {
            // 予算超過が解消されたらsessionStorageから削除（次に超過したら再度通知）
            sessionStorage.removeItem(storageKey);
            return;
        }

        const notifiedValue = sessionStorage.getItem(storageKey);
        if (notifiedValue === String(remaining)) return; // 超過&remainingが前回通知と同じ場合

        // 超過&remainingが変化した場合にトースト表示し、sessionStorage更新
        toast.warning(`今月の予算を¥${Math.abs(remaining).toLocaleString()}超過しています`, {
            id: "budget-over",
        });
        sessionStorage.setItem(storageKey, String(remaining));
    }, [isOver, remaining, budget, currentMonth]);

    if (budgetLoading || logsLoading) {
        return (
            <div className="space-y-4 mb-6">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
            </div>
        );
    }

    if (!budget) {
        return (
            <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">今月の予算</p>
                <Card>
                    <CardContent className="py-4 text-center text-sm text-muted-foreground">
                        今月の予算が設定されていません。{" "}
                        <Link to="/manage-budget/add" className="text-indigo-600 underline">
                            設定する
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mb-6 space-y-3">
            <p className="text-sm font-semibold">今月の予算</p>
            <Card>
                <CardContent className="py-4">
                    {/* 予算サマリー */}
                    <div className="flex justify-between text-sm mb-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">予算額</p>
                            <p className="font-medium">¥{budget.amount.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">使用額</p>
                            <p className="font-medium">¥{usedAmount.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">残り</p>
                            <p className={`font-medium flex items-center justify-end gap-1 ${isOver ? "text-red-500" : ""}`}>
                                {isOver && <AlertTriangle className="w-3.5 h-3.5" />}
                                ¥{remaining.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* カテゴリ別 ドーナツグラフ */}
                    {categoryData.length > 0 ? (
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width={120} height={120}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        innerRadius={35}
                                        outerRadius={55}
                                        dataKey="value"
                                        strokeWidth={2}
                                    />
                                    <Tooltip
                                        formatter={(value, name) => [`¥${Number(value).toLocaleString()}`, name ? CATEGORY_LABEL[name] : ""]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <ul className="flex-1 space-y-1 text-xs">
                                {categoryData.map((entry) => (
                                    <li key={entry.name} className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                style={{ backgroundColor: entry.fill }}
                                            />
                                            {CATEGORY_LABEL[entry.name] ?? entry.name}
                                        </span>
                                        <span className="text-muted-foreground">
                                            ¥{entry.value.toLocaleString()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            今月の記録はまだありません
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
