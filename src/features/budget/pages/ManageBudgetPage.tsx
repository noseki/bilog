import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"
import { PlusIcon} from "lucide-react"
import { useFetchBudgets } from "../hooks/useBudgets";

import { BudgetCard } from "../components/BudgetCard";

export const ManageBudgetPage = () => {
    const { data: budgets, isLoading, isError } = useFetchBudgets();

    if (isLoading) return <p className="p-4 text-gray-500">読み込み中...</p>;
    if (isError || !budgets)
        return <p className="p-4 text-red-500">データの取得に失敗しました</p>;

    return (
        <div className="mx-auto w-full max-w-sm">
            <div className="flex justify-end mb-2">
                <Button asChild variant="outline" >
                    <Link to="/manage-budget/add">
                        <PlusIcon />
                        記録する
                    </Link>
                </Button>
            </div>
            {budgets.length === 0 ? (
                <p>まだ記録がありません</p>
            ) : (
                budgets.map((budget) => (
                    <section key={budget.id}>
                        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                            {budget.year_month}
                        </h2>
                        <BudgetCard budget={budget} />
                    </section>
                ))
            )}
        </div>
    );
};
