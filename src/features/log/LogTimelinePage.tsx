import { groupLogsByMonth } from "@/utils/log";
import { useLogs } from "./useLogs";
import { LogCard } from "./LogCard";

export const LogTimelinePage = () => {
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
                            <LogCard key={log.id} log={log} />
                        ))}
                    </section>
                )
            ))}
        </div>
    );
};

