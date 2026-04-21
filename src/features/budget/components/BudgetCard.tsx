import type { Tables } from "@/types/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { useFetchLogsByYearMonth } from "@/features/log/hooks/useLogs";
import { AlertTriangle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Ellipsis, PencilIcon, TrashIcon } from "lucide-react"
import { useNavigate } from "react-router-dom";
import { useDeleteBudget } from "../hooks/useBudgets";
import { Button } from "@/components/ui/button";

type Budget = Tables<"budgets">;

export const BudgetCard = ({ budget }: { budget: Budget }) => {
    const navigate = useNavigate();
    const { data: logs } = useFetchLogsByYearMonth(budget.year_month);
    const usedAmount = logs?.reduce((sum, log) => sum + log.cost, 0) ?? 0;
    const remaining = budget.amount - usedAmount;
    const isOver = remaining < 0;

    const deleteMutation = useDeleteBudget();

    const handleDelete = async (id: string) => {
        if (!window.confirm(`記録を削除しますか？`)) return;
        deleteMutation.mutate(id);
        navigate("/manage-budget");
    };

    return (
        <Card className="relative mx-auto my-4 w-full max-w-sm pt-0">
            <CardContent className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0 space-y-2">
                    <div>
                        <p className="text-xs text-muted-foreground mb-0.5">予算額</p>
                        <p className="font-medium">¥{budget.amount.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-0.5">使用額</p>
                        <p className="font-medium">¥{usedAmount.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-0.5">残予算</p>
                        <p className={`font-medium flex items-center gap-1 ${isOver ? "text-red-500" : ""}`}>
                            {isOver && <AlertTriangle className="w-3.5 h-3.5" />}
                            ¥{remaining.toLocaleString()}
                        </p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label="オプション">
                            <Ellipsis />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={() => navigate(`/manage-budget/${budget.id}/edit`)}
                        >
                            <PencilIcon />
                            編集する
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(String(budget.id))}
                        >
                            <TrashIcon />
                            削除する
                        </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    );
};
