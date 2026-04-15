import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { logSchema, type LogValues } from "./schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react"
import { CATEGORY_LABEL } from "@/utils/log";
import { useCreateLog, useUpdateLog } from "./useLogs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";

// 画像をsupabase storageにアップロードする
async function uploadImage(file: File, userId: string, prefix: "before" | "after"): Promise<string> {
    const timestamp = Date.now(); // タイムスタンプ生成 → ファイル名衝突を防止
    const filePath = `${userId}/${timestamp}_${prefix}_${file.name}`;

    const { error: uploadError } = await supabase.storage.from("images").upload(filePath, file);
    if (uploadError) throw new Error(`画像アップロード失敗 (${prefix}): ${uploadError.message}`);

    return filePath; // pathを保存する（表示時に都度URL生成）
}

type LogFormProps = {
    defaultValues?: Partial<LogValues>;  // 編集時のみ渡す
    logId?: string;                      // 編集時のみ渡す
    existingBeforePhotoUrl?: string | null;
    existingAfterPhotoUrl?: string | null;
    isEdit?: boolean;
}

export const LogForm = ({ defaultValues, logId, existingBeforePhotoUrl, existingAfterPhotoUrl, isEdit }: LogFormProps) => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const createMutation = useCreateLog();
    const updateMutation = useUpdateLog();

    const {
        control,
        handleSubmit,
        trigger,
        formState: { isSubmitting },
    } = useForm<LogValues>({
        resolver: zodResolver(logSchema),
        defaultValues: defaultValues ?? {
            category: "",
            title: "",
            cost: 0,
            detail: "",
            salon_name: null,
            staff_name: null,
        },
    });

    const onSubmit = async (data: LogValues) => {
        try {
            setError("");
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw new Error('認証情報の取得に失敗しました');

            const [beforeUrl, afterUrl] = await Promise.all([
                data.before_photo_url?.[0]
                    ? uploadImage(data.before_photo_url[0], user.id, "before")
                    : Promise.resolve(existingBeforePhotoUrl ?? null), // 新規ファイルがなければ既存pathを保持
                data.after_photo_url?.[0]
                    ? uploadImage(data.after_photo_url[0], user.id, "after")
                    : Promise.resolve(existingAfterPhotoUrl ?? null),
            ]);
            // mutateAsync()はasync/await形式(try/catchでエラーハンドリングしたいのでmutateAsync使用)
            if (logId) {
                await updateMutation.mutateAsync({
                    logId,
                    userId: user.id,
                    formData: data,
                    photoUrls: { before: beforeUrl, after: afterUrl },
                });
            } else {
                await createMutation.mutateAsync({
                    userId: user.id,
                    formData: data,
                    photoUrls: { before: beforeUrl, after: afterUrl },
                });
            }
            navigate("/log-timeline");
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
                        {/* カテゴリー */}
                        <Controller
                            name="category"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        カテゴリー<span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Select
                                        name={field.name}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger
                                            id={field.name}
                                            aria-invalid={fieldState.invalid}
                                        >
                                            <SelectValue placeholder="選択してください" />
                                        </SelectTrigger>
                                        <SelectContent position="item-aligned">
                                            {Object.keys(CATEGORY_LABEL).map((key) => (
                                                <SelectItem key={key} value={key}>
                                                    {CATEGORY_LABEL[key]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                            />

                        {/* タイトル */}
                        <Controller
                            name="title"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        タイトル<span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id={field.name}
                                        type="text"
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                        placeholder="（例）ハイライト＋グレージュ"
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        {/* 詳細メモ */}
                        <Controller
                            name="detail"
                            control={control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel htmlFor={field.name}>
                                        詳細メモ
                                    </FieldLabel>
                                    <Textarea
                                        id={field.name}
                                        {...field}
                                        value={field.value ?? ""}
                                        placeholder="（例）ブリーチあり / トーン13 / バレイヤージュ"
                                        className="min-h-[120px]"
                                    />
                                </Field>
                            )}
                        />
                        {/* 金額 */}
                        <Controller
                            name="cost"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        金額<span className="text-red-500">*</span>
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
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        {/* 実施日 */}
                        <Controller
                            name="done_at"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        実施日<span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                data-empty={!field.value}
                                                className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                                            >
                                                {field.value ? field.value.toLocaleDateString() : <span>日付を選択してください</span>}
                                            <ChevronDownIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={(day) => field.onChange(day)}
                                                defaultMonth={field.value}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        {/* 実施前の写真 */}
                        <Controller
                            name="before_photo_url"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        実施前の写真
                                    </FieldLabel>
                                    <Input
                                        id={field.name}
                                        type="file"
                                        name={field.name}
                                        ref={field.ref}
                                        onBlur={field.onBlur}
                                        aria-invalid={fieldState.invalid}
                                        onChange={(event) => {
                                            field.onChange(event.target.files);
                                            trigger(field.name);
                                        }}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        {existingBeforePhotoUrl && (
                            <div className="aspect-video max-w-[560px]">
                                <img
                                    src={existingBeforePhotoUrl}
                                    alt="実施前の写真"
                                    className="w-full h-full object-contain object-center"
                                />
                            </div>
                        )}
                        {/* 実施後の写真 */}
                        <Controller
                            name="after_photo_url"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        実施後の写真
                                    </FieldLabel>
                                    <Input
                                        id={field.name}
                                        type="file"
                                        name={field.name}
                                        ref={field.ref}
                                        onBlur={field.onBlur}
                                        aria-invalid={fieldState.invalid}
                                        onChange={(event) => {
                                            field.onChange(event.target.files);
                                            trigger(field.name);
                                        }}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        {existingAfterPhotoUrl && (
                            <div className="aspect-video max-w-[560px]">
                                <img
                                    src={existingAfterPhotoUrl}
                                    alt="実施後の写真"
                                    className="w-full h-full object-contain object-center"
                                />
                            </div>
                        )}
                        {/* 店舗名（TODO:過去のsalon_nameからサジェスト */}
                        <Controller
                            name="salon_name"
                            control={control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel htmlFor={field.name}>
                                        店舗名
                                    </FieldLabel>
                                    <Input
                                        id={field.name}
                                        type="text"
                                        {...field}
                                        value={field.value ?? ""}
                                    />
                                </Field>
                            )}
                        />
                        {/* 担当者名（TODO:過去のstaff_nameからサジェスト */}
                        <Controller
                            name="staff_name"
                            control={control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel htmlFor={field.name}>
                                        担当者名
                                    </FieldLabel>
                                    <Input
                                        id={field.name}
                                        type="text"
                                        {...field}
                                        value={field.value ?? ""}
                                    />
                                </Field>
                            )}
                        />
                        <Button type="submit">
                            {isSubmitting
                                ? (isEdit ? "更新中..." : "追加中...")
                                : (isEdit ? "記録を更新する" : "記録を追加する")}
                        </Button>
                    </FieldGroup>
                </CardContent>
            </form>
        </Card>
    );
}
