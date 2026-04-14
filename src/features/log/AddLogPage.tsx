import { Button } from "@/components/ui/button";
import type { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { LogForm } from "./LogForm";

export const AddLogPage = ({ session }: { session: Session }) => {
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
            <LogForm session={session} />
        </>
    )
}
