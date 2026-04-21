import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useCreateBudget, useUpdateBudget } from "../hooks/useBudgets";

const budgetSchema = z.object({
    year_month: z.string().min(1, { message: "年月を選択してください" }),
    amount: z.number().int('整数で入力してください').min(0, { message: "0以上の金額を入力してください" }),
});

export type budgetValues = z.infer<typeof budgetSchema>;

type budgetFormProps = {
    defaultValues?: Partial<budgetValues>; // 編集時のみ渡す
    budgetId?: string; // 編集時のみ渡す
    isEdit?: boolean;
};

export const BudgetForm = ({
    defaultValues,
    budgetId,
    isEdit,
}: budgetFormProps) => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const createMutation = useCreateBudget();
    const updateMutation = useUpdateBudget();

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<budgetValues>({
        resolver: zodResolver(budgetSchema),
        defaultValues: defaultValues ?? {
            amount: 0,
        },
    });

    const onSubmit = async (data: budgetValues) => {
        try {
            setError("");
            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();
            if (authError || !user) throw new Error("認証情報の取得に失敗しました");


            // mutateAsync()はasync/await形式(try/catchでエラーハンドリングしたいのでmutateAsync使用)
            if (budgetId) {
                await updateMutation.mutateAsync({
                    id: budgetId,
                    amount: data.amount,
                });
            } else {
                await createMutation.mutateAsync({
                    userId: user.id,
                    formData: data,
                });
            }
            navigate("/manage-budget");
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            console.error("onSubmit error:", message);
            setError("保存に失敗しました。入力内容を確認してください。");
        }
    };

    return (
        <Card className="relative my-8 mx-auto w-full max-w-sm">
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardHeader className="mb-4">
                <CardTitle>{isEdit ? "記録編集" : "記録追加"}</CardTitle>
                {error && <div className="text-red-500">{error}</div>}
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        {/* 年月 */}
                        <Controller
                        name="year_month"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>
                                対象年月<span className="text-red-500">*</span>
                            </FieldLabel>
                            <Input
                                id={field.name}
                                type="month"
                                {...field}
                                aria-invalid={fieldState.invalid}
                                disabled={isEdit}
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                            </Field>
                        )}
                        />
                        {/* 予算額 */}
                        <Controller
                            name="amount"
                            control={control}
                            render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>
                                    予算額<span className="text-red-500">*</span>
                                </FieldLabel>
                                <Input
                                    id={field.name}
                                    type="text"
                                    inputMode="numeric"
                                    {...field}
                                    value={Number(field.value).toLocaleString("ja-JP")}
                                    onChange={(event) => {
                                        const raw = event.target.value.replace(/,/g, "");
                                        const num = parseInt(raw, 10);
                                        field.onChange(isNaN(num) ? 0 : num);
                                    }}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                                </Field>
                            )}
                        />
                        <Button type="submit">
                            {isSubmitting
                                ? isEdit
                                ? "更新中..."
                                : "追加中..."
                                : isEdit
                                ? "記録を更新する"
                                : "記録を追加する"}
                        </Button>
                    </FieldGroup>
                </CardContent>
            </form>
        </Card>
    )
}

