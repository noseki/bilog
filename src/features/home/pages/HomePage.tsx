import { BudgetSummary } from "../components/BudgetSummary";
import { CategoryPhotoTimeline } from "../components/CategoryPhotoTimeline";

export const HomePage = () => {
    return (
        <div className="mx-auto w-full max-w-sm">
            <BudgetSummary />
            <CategoryPhotoTimeline />
        </div>
    );
};
