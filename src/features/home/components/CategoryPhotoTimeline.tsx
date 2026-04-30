import { cn } from "@/lib/utils";
import { useFetchLogsWithAfterPhotos } from "../../log/hooks/useLogs";
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  formatFullDate,
} from "@/features/log/utils/log";
import { Link } from "react-router-dom";
import { SpinnerCustom } from "@/components/ui/spinner";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { ImageIcon, PlusIcon } from "lucide-react";

export const CategoryPhotoTimeline = () => {
  const { data: logs, isLoading, isError } = useFetchLogsWithAfterPhotos();

  if (isLoading) return <SpinnerCustom />;
  if (isError || !logs)
    return <p className="p-4 text-red-500">データの取得に失敗しました</p>;

  const sortedLogs = [...logs].sort((a, b) => {
    const res = a.done_at.localeCompare(b.done_at); // done_atの昇順にソート
    return res !== 0 ? res : a.created_at.localeCompare(b.created_at); // done_atが同じ場合はcreated_atの昇順にソート
  });

  const categoryGroups = CATEGORY_ORDER.map((category) => ({
    category,
    categoryLogs: sortedLogs
      .filter((log) => log.category === category)
      .slice(-10), // 直近10件
  })).filter((group) => group.categoryLogs.length > 0);

  return (
    <div className="space-y-6">
      <p className="text-sm font-bold">美容履歴（直近10件）</p>
      {categoryGroups.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageIcon className="w-6 h-6" />
            </EmptyMedia>
            <EmptyTitle>写真がありません</EmptyTitle>
            <EmptyDescription>実施後の写真付きの記録を追加すると、ここに表示されます</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link to="/log-timeline/add">
                <PlusIcon />
                記録する
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        categoryGroups.map(({ category, categoryLogs }) => (
          <section key={category}>
            <span
              className={cn(
                "mb-3 inline-block rounded-full px-2 py-1 text-xs font-medium",
                CATEGORY_COLOR[category],
              )}
            >
              {CATEGORY_LABEL[category]}
            </span>
            {/* スクロールビュー */}
            <div
              className="flex gap-3 overflow-x-scroll pb-3
                            [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full
                            [&::-webkit-scrollbar-thumb]:bg-gray-300"
            >
              {categoryLogs.map((log) => (
                <Link
                  key={log.id}
                  to={`/log-timeline/${log.id}`}
                  className="w-28 shrink-0"
                  data-testid="categoryLogs-item"
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                    <img
                      src={log.after_photo_url!}
                      alt={log.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-1 truncate text-xs font-medium">{log.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatFullDate(log.done_at)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
};
