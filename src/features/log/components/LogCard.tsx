import type { Tables } from "@/types/supabase";
import { Card, CardContent } from "@/components/ui/card";
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  formatMonthDay,
} from "@/features/log/utils/log";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { MapPin } from 'lucide-react';
import { UserRound } from 'lucide-react';

type Log = Tables<"logs">;

export const LogCard = ({ log }: { log: Log }) => {
  return (
    <Link to={`/log-timeline/${log.id}`}>
      <Card key={log.id} className="relative mx-auto my-4 w-full max-w-sm pt-0">
        <CardContent className="flex items-start gap-3 py-3">
          {/* カテゴリバッジ */}
          <span
            className={cn(
              "shrink-0 w-14 text-center rounded-full px-2 py-1 text-xs font-medium",
              CATEGORY_COLOR[log.category],
            )}
          >
            {CATEGORY_LABEL[log.category]}
          </span>

          {/* タイトル・サロン名・担当者名 */}
          <div className="flex-1 min-w-0 space-y-1">
            <p className="font-medium truncate">{log.title}</p>
            {log.salon_name && (
              <p className="flex items-center text-xs text-muted-foreground truncate">
                <MapPin size={16} className="mr-1" />{log.salon_name}
              </p>
            )}
            {log.staff_name && (
              <p className="flex items-center text-xs text-muted-foreground truncate">
                <UserRound size={16} className="mr-1" />{log.staff_name}
              </p>
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
    </Link>
  );
};
