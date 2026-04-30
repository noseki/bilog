import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ClipboardList, PlusIcon } from "lucide-react";
import { CATEGORY_LABEL, groupLogsByMonth } from "@/features/log/utils/log";
import { useFetchLogs } from "../hooks/useLogs";
import { LogCard } from "../components/LogCard";
import { SpinnerCustom } from "@/components/ui/spinner";

const MONTHS_PER_PAGE = 2;

export const LogTimelinePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const { data: logs, isLoading, isError } = useFetchLogs();
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) return <SpinnerCustom />;
  if (isError)
    return <p className="p-4 text-red-500">データの取得に失敗しました</p>;

  const filteredLogs = selectedCategory
    ? (logs ?? []).filter((log) => log.category === selectedCategory)
    : (logs ?? []);
  const grouped = groupLogsByMonth(filteredLogs);
  const totalPages = Math.ceil(grouped.length / MONTHS_PER_PAGE);
  const pagedGroups = grouped.slice(
    (currentPage - 1) * MONTHS_PER_PAGE,
    currentPage * MONTHS_PER_PAGE
  );

  const handleCategoryChange = (category: string | undefined) => {
      setSelectedCategory(category);
      setCurrentPage(1);
  };

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
      {/* カテゴリフィルター */}
      <div className="flex flex-wrap gap-2">
          <button
              onClick={() => handleCategoryChange(undefined)}
              className={`my-2 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === undefined
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
              すべて
          </button>

          {Object.keys(CATEGORY_LABEL).map((key) => (
            <button
                key={key}
                onClick={() => handleCategoryChange(key)}
                className={`my-2 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === key
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
                {CATEGORY_LABEL[key]}
            </button>
          ))}
      </div>
      {grouped.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardList className="w-6 h-6" />
            </EmptyMedia>
            {logs && logs.length > 0 ? (
              <>
                <EmptyTitle>選択したカテゴリの記録がありません</EmptyTitle>
                <EmptyDescription>美容記録を追加しましょう</EmptyDescription>
              </>
            ) : (
              <>
                <EmptyTitle>記録がありません</EmptyTitle>
                <EmptyDescription>最初の美容記録を追加しましょう</EmptyDescription>
              </>
            )}
          </EmptyHeader>
        </Empty>
      ) : (
        <>

          {pagedGroups.map(([monthKey, monthLogs]) => (
            <section key={monthKey}>
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                {monthKey}
              </h2>
              {monthLogs.map((log) => (
                <LogCard key={log.id} log={log} />
              ))}
            </section>
          ))}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => setCurrentPage((p) => p - 1)}
            onNext={() => setCurrentPage((p) => p + 1)}
          />
        </>
      )}
    </div>
  );
};
