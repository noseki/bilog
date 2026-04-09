import type { Tables } from "@/types/supabase";
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORY_COLOR, CATEGORY_LABEL, formatMonthDay } from "@/utils/log";
import { cn } from "@/lib/utils";

type Log = Tables<"logs">;

export const LogCard = ({ log }: {log: Log} ) => {
    return (
        <Card key={log.id} className="relative mx-auto w-full max-w-sm pt-0">
            <CardContent className="flex items-center gap-3 py-3">
                {/* カテゴリバッジ */}
                <span className={cn("rounded-full px-2 py-1 text-xs font-medium", CATEGORY_COLOR[log.category])}>
                    {CATEGORY_LABEL[log.category]}
                </span>

                {/* タイトル・サロン名・担当者名 */}
                <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{log.title}</p>
                    {log.salon_name && (
                    <p className="text-sm text-muted-foreground truncate">{log.salon_name}</p>
                    )}
                    {log.staff_name && (
                    <p className="text-xs text-muted-foreground truncate">担当者：{log.staff_name}</p>
                    )}
                </div>

                {/* 日付・金額 */}
                <div className="text-right shrink-0">
                    <p className="text-sm text-muted-foreground">
                        {formatMonthDay(log.done_at)}
                    </p>
                    <p className="font-medium">¥{log.cost.toLocaleString()}</p>
                </div>
            </CardContent>
        </Card>
    )
}
