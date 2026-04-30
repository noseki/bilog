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
import { budgetSchema, type budgetValues } from "../schema";

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
        trigger,
        formState: { isSubmitting },
    } = useForm<budgetValues>({
        resolver: zodResolver(budgetSchema),
        defaultValues: defaultValues ?? {
            year_month: "",
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
            if (message === "DUPLICATE_YEAR_MONTH") {
                setError("この年月の予算は既に設定されています");
            } else {
                console.error("onSubmit error:", message);
                setError("保存に失敗しました。入力内容を確認してください。");
            }
        }
    };

    return (
        <Card className="relative my-2 mx-auto w-full max-w-sm">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
                        e.preventDefault();
                    }
                    }}
                >
                <CardHeader className="mb-4">
                <CardTitle>{isEdit ? "予算編集" : "予算設定"}</CardTitle>
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
                                className="w-full appearance-none md:[appearance:auto]"
                                onChange={(event) => {
                                    field.onChange(event.target.value);
                                    trigger(field.name);
                                }}
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
                                    value={isNaN(field.value) ? "" : Number(field.value).toLocaleString("ja-JP")}
                                    onChange={(event) => {
                                        const raw = event.target.value.replace(/,/g, "");
                                        const num = parseInt(raw, 10);
                                        field.onChange(isNaN(num) ? NaN : num);
                                        trigger(field.name);
                                    }}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                                </Field>
                            )}
                        />
                        <Button type="submit" className="py-4">
                            {isSubmitting
                                ? isEdit
                                ? "更新中..."
                                : "設定中..."
                                : isEdit
                                ? "予算を更新する"
                                : "予算を設定する"}
                        </Button>
                    </FieldGroup>
                </CardContent>
            </form>
        </Card>
    )
}

