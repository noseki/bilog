import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { PlusIcon, WalletCards } from "lucide-react"
import { useFetchBudgets } from "../hooks/useBudgets";
import { BudgetCard } from "../components/BudgetCard";
import { SpinnerCustom } from "@/components/ui/spinner";

const BUDGETS_PER_PAGE = 6;

export const ManageBudgetPage = () => {
    const { data: budgets, isLoading, isError } = useFetchBudgets();
    const [currentPage, setCurrentPage] = useState(1);

    if (isLoading) return <SpinnerCustom />;
    if (isError || !budgets)
        return <p className="p-4 text-red-500">データの取得に失敗しました</p>;

    const totalPages = Math.ceil(budgets.length / BUDGETS_PER_PAGE);
    const pagedBudgets = budgets.slice(
        (currentPage - 1) * BUDGETS_PER_PAGE,
        currentPage * BUDGETS_PER_PAGE
    );

    return (
        <div className="mx-auto w-full max-w-sm">
            <div className="flex justify-end mb-2">
                <Button asChild variant="outline" >
                    <Link to="/manage-budget/add">
                        <PlusIcon />
                        設定する
                    </Link>
                </Button>
            </div>
            {budgets.length === 0 ? (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <WalletCards className="w-6 h-6" />
                        </EmptyMedia>
                        <EmptyTitle>予算が登録されていません</EmptyTitle>
                        <EmptyDescription>月ごとの美容予算を設定しましょう</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <>
                    {pagedBudgets.map((budget) => (
                        <section key={budget.id}>
                            <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                                {budget.year_month}
                            </h2>
                            <BudgetCard budget={budget} />
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
