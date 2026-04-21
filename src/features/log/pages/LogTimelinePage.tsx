import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { groupLogsByMonth } from "@/features/log/utils/log";
import { useFetchLogs } from "../hooks/useLogs";
import { LogCard } from "../components/LogCard";

export const LogTimelinePage = () => {
  const { data: logs, isLoading, isError } = useFetchLogs();

  if (isLoading) return <p className="p-4 text-gray-500">読み込み中...</p>;
  if (isError)
    return <p className="p-4 text-red-500">データの取得に失敗しました</p>;

  const grouped = groupLogsByMonth(logs ?? []);

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="flex justify-end">
        <Button asChild variant="outline">
          <Link to="/log-timeline/add">
            <PlusIcon />
            記録する
          </Link>
        </Button>
      </div>
      {grouped.length === 0 ? (
        <p>まだ記録がありません</p>
      ) : (
        grouped.map(([monthKey, monthLogs]) => (
          <section key={monthKey}>
            <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
              {monthKey}
            </h2>
            {monthLogs.map((log) => (
              <LogCard key={log.id} log={log} />
            ))}
          </section>
        ))
      )}
    </div>
  );
};
