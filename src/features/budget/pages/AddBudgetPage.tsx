import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom";
import { BudgetForm } from "../components/BudgetForm";

export const AddBudgetPage = () => {
    const navigate = useNavigate();

    return (
        <div className="mx-auto w-full max-w-sm">
            <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-sm mb-2"
            >
                ← 戻る
            </Button>
            <BudgetForm />
        </div>
    );
}

