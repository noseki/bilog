import { CATEGORY_COLOR, CATEGORY_LABEL, groupLogsByMonth } from "@/utils/log";
import { useLogs } from "./useLogs";
import { Card, CardContent } from '@/components/ui/card';
import { cn } from "@/lib/utils";

export const TimelinePage = () => {
    const { data: logs, isLoading, isError } = useLogs();

    if (isLoading) return <p className="p-4 text-gray-500">読み込み中...</p>
    if (isError)   return <p className="p-4 text-red-500">データの取得に失敗しました</p>

    const grouped = groupLogsByMonth(logs ?? []);

    return (
        <div>
            {grouped.length === 0 ? (
                <p>まだ記録がありません</p>
            ) : (
                grouped.map(([monthKey, monthLogs]) => (
                    <section key={monthKey}>
                        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{monthKey}</h2>
                        {monthLogs.map((log) => (
                            <Card key={log.id} className="relative mx-auto w-full max-w-sm pt-0">
                                <CardContent className="flex items-center gap-3 py-3">
                                    {/* カテゴリバッジ */}
                                    <span className={cn("rounded-full px-2 py-1 text-xs font-medium", CATEGORY_COLOR[log.category])}>
                                        {CATEGORY_LABEL[log.category]}
                                    </span>

                                    {/* タイトル・サロン名 */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{log.title}</p>
                                        {log.salon_name && (
                                        <p className="text-sm text-muted-foreground truncate">{log.salon_name}</p>
                                        )}
                                    </div>

                                    {/* 日付・金額 */}
                                    <div className="text-right shrink-0">
                                        <p className="text-sm text-muted-foreground">
                                        {new Date(log.done_at).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}
                                        </p>
                                        <p className="font-medium">¥{log.cost.toLocaleString()}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </section>
                )
            ))}
        </div>
    );
};

