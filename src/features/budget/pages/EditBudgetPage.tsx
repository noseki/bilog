import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { useFetchBudgetById } from "../hooks/useBudgets";
import { BudgetForm } from "../components/BudgetForm";

export const EditBudgetPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { data, isLoading, isError } = useFetchBudgetById(id!);

    if (isLoading) return <p className="p-4 text-gray-500">読み込み中...</p>;
    if (isError || !data)
        return <p className="p-4 text-red-500">データの取得に失敗しました</p>;

    return (
        <div className="mx-auto w-full max-w-sm">
            <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-sm mb-2"
            >
                ← 戻る
            </Button>
            <BudgetForm
                defaultValues={{
                    year_month: data.year_month,
                    amount: data.amount,
                }}
                budgetId={data.id}
                isEdit
            />
        </div>
    )
}
