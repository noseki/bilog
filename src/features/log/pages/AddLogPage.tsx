import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogForm } from "../components/LogForm";

export const AddLogPage = () => {
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
      <LogForm />
    </div>
  );
};
