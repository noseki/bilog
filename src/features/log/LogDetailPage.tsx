import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardTitle,
} from "@/components/ui/card"
import { CATEGORY_COLOR, CATEGORY_LABEL } from "@/utils/log";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate, useParams } from "react-router-dom";
import { Ellipsis, PencilIcon, TrashIcon } from 'lucide-react';
import { useDeleteLog, useFetchLog } from "./useLogs";
import { formatFullDate } from '../../utils/log';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export const LogDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { data: log, isLoading, isError } = useFetchLog(id!);
    const hasBeforePhoto = !!log?.before_photo_url;
    const hasAfterPhoto = !!log?.after_photo_url;
    const hasPhotos = hasBeforePhoto || hasAfterPhoto;

    const deleteMutation = useDeleteLog();

    const handleDelete = async (id: string) => {
        if (!window.confirm(`記録を削除しますか？`)) return;
        deleteMutation.mutate(id);
        navigate("/log-timeline");
    };

    if (isLoading) return <p className="p-4 text-gray-500">読み込み中...</p>
    if (isError || !log) return <p className="p-4 text-red-500">データの取得に失敗しました</p>

    return (
        <div className="mx-auto w-full max-w-sm">
            <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="text-sm mb-2"
            >
                    ← 戻る
            </Button>
            <Card className="relative mx-auto w-full max-w-sm pt-0">
                <CardContent className="pt-4 pb-6 px-4 space-y-4">
                    {/* カテゴリー・タイトル・オプションメニュー */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <Badge
                                className={cn(
                                    "shrink-0 rounded-full px-2 py-1 text-xs font-medium border-0",
                                    CATEGORY_COLOR[log.category],
                                )}
                            >
                                {CATEGORY_LABEL[log.category]}
                            </Badge>
                            <CardTitle className="text-base font-semibold leading-snug break-words">{log.title}</CardTitle>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm" aria-label="オプション">
                                    <Ellipsis />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => navigate(`/log-timeline/${id}/edit`)}>
                                        <PencilIcon />
                                        編集する
                                    </DropdownMenuItem>
                                    <DropdownMenuItem variant="destructive" onClick={() => handleDelete(String(id))}>
                                        <TrashIcon />
                                        削除する
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* 日付 */}
                    <p className="text-sm text-muted-foreground">{formatFullDate(log.done_at)}</p>

                    {/* before/after写真 */}
                    {hasPhotos && (
                        <div>
                            {hasBeforePhoto && hasAfterPhoto ? (
                                // 写真がbefore/afterどちらもある場合
                                <div className="grid grid-col-2 gap-2">
                                    <PhotoSlot src={log.before_photo_url!} label="Before" />
                                    <PhotoSlot src={log.after_photo_url!} label="After" />
                                </div>
                            )
                            : (
                                // 写真が片方しかない場合
                                <div className="max-w-[180px] mx-auto">
                                    <PhotoSlot
                                        src={(log.before_photo_url ?? log.after_photo_url)!}
                                        label={hasBeforePhoto ? "Before" : "After"}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    <Separator />
                    {/* 金額 */}
                    <p className="text-lg font-semibold">¥{log.cost.toLocaleString()}</p>

                    {/* 詳細メモ */}
                    {log.detail && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">メモ</p>
                            <p className="text-sm whitespace-pre-wrap">{log.detail}</p>
                        </div>
                    )}

                    {/* サロン名・担当者名 */}
                    {(log.salon_name || log.staff_name) && (
                        <div className="space-y-1">
                            {log.salon_name && (
                                <p className="text-sm">{log.salon_name}</p>
                            )}
                            {log.staff_name && (
                                <p className="text-sm text-muted-foreground">担当者：{log.staff_name}</p>
                            )}
                        </div>
                    )}

                    {/* TODO:次回目安 */}
                    {log.next_interval_days != null && (
                        <p className="text-sm text-muted-foreground">次回目安：{log.next_interval_days}日後</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

type PhotoSlotProps = {
    src: string;
    label: string;
}

const PhotoSlot = ({ src, label }: PhotoSlotProps) => (
    <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
        <img
            src={src}
            alt={label}
            className="w-full h-full object-cover"
        />
        <span className="absolute top-1.5 left-1.5 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {label}
        </span>
    </div>
);
