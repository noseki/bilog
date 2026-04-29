import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { logSchema, type LogValues } from "../schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { CATEGORY_LABEL } from "@/features/log/utils/log";
import { useCreateLog, useUpdateLog } from "../hooks/useLogs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { useGetImageUrl } from "../hooks/useGetImageUrl";
import AsyncCreatableSelect from 'react-select/async-creatable';
import { cn } from "@/lib/utils";

// 画像をsupabase storageにアップロードする
async function uploadImage(
  file: File,
  userId: string,
  prefix: "before" | "after",
): Promise<string> {
  const timestamp = Date.now(); // タイムスタンプ生成 → ファイル名衝突を防止
  const filePath = `${userId}/${timestamp}_${prefix}_${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("images")
    .upload(filePath, file);
  if (uploadError)
    throw new Error(`画像アップロード失敗 (${prefix}): ${uploadError.message}`);

  return filePath; // pathを保存する（表示時に都度URL生成）
}

type LogFormProps = {
  defaultValues?: Partial<LogValues>; // 編集時のみ渡す
  logId?: string; // 編集時のみ渡す
  existingBeforePhotoUrl?: string | null; // 表示用 signed URL
  existingAfterPhotoUrl?: string | null;  // 表示用 signed URL
  existingBeforePhotoPath?: string | null; // 保存用の生パス
  existingAfterPhotoPath?: string | null;  // 保存用の生パス
  isEdit?: boolean;
};

export const LogForm = ({
  defaultValues,
  logId,
  existingBeforePhotoUrl,
  existingAfterPhotoUrl,
  existingBeforePhotoPath,
  existingAfterPhotoPath,
  isEdit,
}: LogFormProps) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [imageBeforePhotoFile, setImageBeforePhotoFile] = useState<File | null>(null);
  const [imageAfterPhotoFile, setImageAfterPhotoFile] = useState<File | null>(null);
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

  const { imageUrl: imageBeforePhotoUrl } = useGetImageUrl({ file: imageBeforePhotoFile });
  const { imageUrl: imageAfterPhotoUrl } = useGetImageUrl({ file: imageAfterPhotoFile });

  // salonsテーブルに存在する店舗名を取得してセレクトの候補にする（スタッフ名も同様）
  const loadSalonOptions = async (inputValue: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('salons')
      .select('name')
      .eq('user_id', user.id)
      .limit(20);

    if (inputValue) {
      query = query.ilike('name', `%${inputValue}%`);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    const unique = [...new Set(data.map((d) => d.name as string))];
    return unique.map((name) => ({ value: name, label: name }));
  };

  const loadStaffOptions = async (inputValue: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('staffs')
      .select('name')
      .eq('user_id', user.id)
      .limit(20);

    if (inputValue) {
      query = query.ilike('name', `%${inputValue}%`);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    const unique = [...new Set(data.map((d) => d.name as string))];
    return unique.map((name) => ({ value: name, label: name }));
  };

  const onSubmit = async (data: LogValues) => {
    try {
      setError("");
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("認証情報の取得に失敗しました");

      const [beforeUrl, afterUrl] = await Promise.all([
        data.before_photo_url?.[0]
          ? uploadImage(data.before_photo_url[0], user.id, "before")
          : Promise.resolve(existingBeforePhotoPath ?? null), // 新規ファイルがなければ既存パスを保持
        data.after_photo_url?.[0]
          ? uploadImage(data.after_photo_url[0], user.id, "after")
          : Promise.resolve(existingAfterPhotoPath ?? null),
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* 詳細メモ */}
            <Controller
              name="detail"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>詳細メモ</FieldLabel>
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                        {field.value ? (
                          field.value.toLocaleDateString()
                        ) : (
                          <span>日付を選択してください</span>
                        )}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* 実施前の写真 */}
            <Controller
              name="before_photo_url"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>実施前の写真</FieldLabel>
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
                      if (event.target.files && event.target.files[0]) {
                        setImageBeforePhotoFile(event.target.files[0]);
                      }
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {(imageBeforePhotoUrl || existingBeforePhotoUrl) && (
              <div className="relative aspect-[3/4] w-[180px] mx-auto overflow-hidden">
                <img
                  src={imageBeforePhotoUrl || existingBeforePhotoUrl!}
                  alt="実施前の写真"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {/* 実施後の写真 */}
            <Controller
              name="after_photo_url"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>実施後の写真</FieldLabel>
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
                      if (event.target.files && event.target.files[0]) {
                        setImageAfterPhotoFile(event.target.files[0]);
                      }
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {(imageAfterPhotoUrl || existingAfterPhotoUrl) && (
              <div className="relative aspect-[3/4]  w-[180px] mx-auto overflow-hidden">
                <img
                  src={imageAfterPhotoUrl || existingAfterPhotoUrl!}
                  alt="実施後の写真"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {/* 店舗名 */}
            <Controller
              name="salon_name"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>店舗名</FieldLabel>
                  <AsyncCreatableSelect
                    inputId={field.name}
                    value={field.value ? { value: field.value, label: field.value } : null}
                    onChange={(option) => field.onChange(option?.value ?? null)}
                    onBlur={field.onBlur}
                    loadOptions={loadSalonOptions}
                    defaultOptions
                    cacheOptions
                    isClearable
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    placeholder="店舗名を入力または選択"
                    formatCreateLabel={(input) => `「${input}」を追加`}
                    noOptionsMessage={() => "候補がありません"}
                    unstyled
                    classNames={{
                      control: ({ isFocused }) =>
                        cn(
                          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                          isFocused && "outline-none ring-2 ring-ring ring-offset-2",
                        ),
                      placeholder: () => "text-muted-foreground text-sm",
                      input: () => "text-sm",
                      menuPortal: () => "z-50",
                      menu: () => "rounded-md border border-input bg-background shadow-md",
                      option: ({ isFocused }) =>
                        cn("px-3 py-2 text-sm cursor-pointer", isFocused && "bg-accent"),
                      singleValue: () => "text-sm",
                      clearIndicator: () => "text-muted-foreground hover:text-foreground cursor-pointer px-1",
                      indicatorSeparator: () => "hidden",
                      dropdownIndicator: () => "hidden",
                    }}
                  />
                </Field>
              )}
            />
            {/* 担当者名 */}
            <Controller
              name="staff_name"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>担当者名</FieldLabel>
                  <AsyncCreatableSelect
                    inputId={field.name}
                    value={field.value ? { value: field.value, label: field.value } : null}
                    onChange={(option) => field.onChange(option?.value ?? null)}
                    onBlur={field.onBlur}
                    loadOptions={loadStaffOptions}
                    defaultOptions
                    cacheOptions
                    isClearable
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    placeholder="担当者名を入力または選択"
                    formatCreateLabel={(input) => `「${input}」を追加`}
                    noOptionsMessage={() => "候補がありません"}
                    unstyled
                    classNames={{
                      control: ({ isFocused }) =>
                        cn(
                          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                          isFocused && "outline-none ring-2 ring-ring ring-offset-2",
                        ),
                      placeholder: () => "text-muted-foreground text-sm",
                      input: () => "text-sm",
                      menuPortal: () => "z-50",
                      menu: () => "rounded-md border border-input bg-background shadow-md",
                      option: ({ isFocused }) =>
                        cn("px-3 py-2 text-sm cursor-pointer", isFocused && "bg-accent"),
                      singleValue: () => "text-sm",
                      clearIndicator: () => "text-muted-foreground hover:text-foreground cursor-pointer px-1",
                      indicatorSeparator: () => "hidden",
                      dropdownIndicator: () => "hidden",
                    }}
                  />
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
  );
};
