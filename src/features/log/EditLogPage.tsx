import { useNavigate, useParams } from "react-router-dom";
import { useFetchLog } from "./useLogs";
import { Button } from "@/components/ui/button";
import { LogForm } from "./LogForm";

export const EditLogPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { data, isLoading, isError } = useFetchLog(id!);

    if (isLoading) return <p className="p-4 text-gray-500">読み込み中...</p>
    if (isError || !data) return <p className="p-4 text-red-500">データの取得に失敗しました</p>

    return (
        <div className="mx-auto w-full max-w-sm">
            <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-sm mb-2"
            >
                ← 戻る
            </Button>
            <LogForm
                defaultValues={{
                    category: data.category,
                    title: data.title,
                    cost: data.cost,
                    done_at: new Date(data.done_at + "T00:00:00"), // ローカル時刻として解釈
                    detail: data.detail,
                    salon_name: data.salon_name,
                    staff_name: data.staff_name,
                }}
                logId={data.id}
                existingBeforePhotoUrl={data.before_photo_url}
                existingAfterPhotoUrl={data.after_photo_url}
                isEdit
            />
        </div>
    );
}
