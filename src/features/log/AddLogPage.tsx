import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogForm } from "./LogForm";

export const AddLogPage = () => {
    const navigate = useNavigate();

    return (
        <>
            <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-sm"
            >
                ← 戻る
            </Button>
            <LogForm />
        </>
    )
}
