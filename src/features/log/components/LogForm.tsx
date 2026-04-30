import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { logSchema, type LogValues } from "../schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
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
import { X } from 'lucide-react';

type SalonOption = { value: string; label: string; salonId?: string };
type StaffOption = { value: string; label: string; salonId?: string; salonName?: string };

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

  const [clearBefore, setClearBefore] = useState(false);
  const [clearAfter, setClearAfter] = useState(false);
  const [clearExistingBefore, setClearExistingBefore] = useState(false);
  const [clearExistingAfter, setClearExistingAfter] = useState(false);
  const [beforePhotoKey, setBeforePhotoKey] = useState(0);
  const [afterPhotoKey, setAfterPhotoKey] = useState(0);

  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);
  const createMutation = useCreateLog();
  const updateMutation = useUpdateLog();
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  const {
    control,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<LogValues>({
    resolver: zodResolver(logSchema),
    defaultValues: defaultValues ?? {
      category: "",
      title: "",
      detail: "",
      salon_name: null,
      staff_name: null,
    },
  });

  const { imageUrl: imageBeforePhotoUrl } = useGetImageUrl({ file: imageBeforePhotoFile });
  const { imageUrl: imageAfterPhotoUrl } = useGetImageUrl({ file: imageAfterPhotoFile });

  const watchedSalonName = watch("salon_name");

  // 編集時: 既存の salon_name から salon_id を初期ロード
  useEffect(() => {
    if (!defaultValues?.salon_name) return;
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("salons")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", defaultValues.salon_name!)
        .maybeSingle();
      if (data) setSelectedSalonId(data.id);
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // salonsテーブルに存在する店舗名を取得してセレクトの候補にする（スタッフ名も同様）
  const loadSalonOptions = async (inputValue: string): Promise<SalonOption[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('salons')
      .select('id, name')
      .eq('user_id', user.id)
      .limit(20);

    if (inputValue) {
      query = query.ilike('name', `%${inputValue}%`);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    const seen = new Set<string>();
    return data
      .filter((d) => { if (seen.has(d.name)) return false; seen.add(d.name); return true; })
      .map((d) => ({ value: d.name, label: d.name, salonId: d.id }));
  };

  const loadStaffOptions = async (inputValue: string): Promise<StaffOption[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 新規店舗（DB未登録）が選択されている場合は担当者候補を出さない
    if (watchedSalonName && !selectedSalonId) return [];

    let query = supabase
      .from('staffs')
      .select('name, salon_id, salons(name)')
      .eq('user_id', user.id)
      .limit(20);

    if (selectedSalonId) {
      query = query.eq('salon_id', selectedSalonId);
    }

    if (inputValue) {
      query = query.ilike('name', `%${inputValue}%`);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    const seen = new Set<string>();
    return data
      .filter((d) => { if (seen.has(d.name)) return false; seen.add(d.name); return true; })
      .map((d) => ({
        value: d.name,
        label: d.name,
        salonId: d.salon_id ?? undefined,
        salonName: (d.salons as { name: string } | null)?.name ?? undefined,
      }));
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
          : Promise.resolve(clearExistingBefore ? null : existingBeforePhotoPath ?? null),
        data.after_photo_url?.[0]
          ? uploadImage(data.after_photo_url[0], user.id, "after")
          : Promise.resolve(clearExistingAfter ? null : existingAfterPhotoPath ?? null),
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
    <Card className="relative my-2 mx-auto w-full max-w-sm overflow-visible">
      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
            e.preventDefault();
          }
        }}
      >
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
            {/* 詳細メモ */}
            <Controller
              name="detail"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>詳細メモ</FieldLabel>
                  <Textarea
                    id={field.name}
                    {...field}
                    value={field.value ?? ""}
                    placeholder="（例）ブリーチあり / トーン13 / バレイヤージュ"
                    className="min-h-[120px]"
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
                    key={beforePhotoKey}
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
            {((imageBeforePhotoUrl && !clearBefore) || (existingBeforePhotoUrl && !clearExistingBefore)) && (
              <div className="flex items-start gap-2">
                <div className="relative aspect-[3/4] w-[180px] mx-auto overflow-hidden">
                  <img
                    src={imageBeforePhotoUrl || existingBeforePhotoUrl!}
                    alt="実施前の写真"
                    className="w-full h-full object-cover"
                  />
                </div>
                <X className="cursor-pointer" onClick={() => {
                  setImageBeforePhotoFile(null);
                  setClearBefore(true);
                  setValue("before_photo_url", undefined);
                  setClearExistingBefore(true);
                  setBeforePhotoKey(k => k + 1);
                }} />
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
                    key={afterPhotoKey}
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
            {((imageAfterPhotoUrl && !clearAfter) || (existingAfterPhotoUrl && !clearExistingAfter)) && (
              <div className="flex items-start gap-2">
                <div className="relative aspect-[3/4] w-[180px] mx-auto overflow-hidden">
                  <img
                    src={imageAfterPhotoUrl || existingAfterPhotoUrl!}
                    alt="実施後の写真"
                    className="w-full h-full object-cover"
                  />
                </div>
                <X className="cursor-pointer" onClick={() => {
                  setImageAfterPhotoFile(null);
                  setValue("after_photo_url", undefined);
                  setClearAfter(true);
                  setClearExistingAfter(true);
                  setAfterPhotoKey(k => k + 1);
                }} />
              </div>
            )}
            {/* 店舗名 */}
            <Controller
              name="salon_name"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>店舗名</FieldLabel>
                  <AsyncCreatableSelect<SalonOption>
                    inputId={field.name}
                    value={field.value ? { value: field.value, label: field.value } : null}
                    onChange={(option) => {
                      field.onChange(option?.value ?? null);
                      setSelectedSalonId(option?.salonId ?? null);
                      setValue("staff_name", null);
                      trigger(field.name);
                    }}
                    onBlur={field.onBlur}
                    loadOptions={loadSalonOptions}
                    defaultOptions
                    cacheOptions
                    isClearable
                    placeholder="店舗名を入力または選択"
                    formatCreateLabel={(input) => `「${input}」を追加`}
                    noOptionsMessage={() => "候補がありません"}
                    unstyled
                    menuShouldBlockScroll
                    classNames={{
                      control: ({ isFocused }) =>
                        cn(
                          "flex w-full items-center rounded-md border border-input bg-background px-3 text-sm ring-offset-background",
                          isFocused && "outline-none ring-2 ring-ring ring-offset-2",
                        ),
                      valueContainer: () => "flex-1 p-0 gap-1",
                      placeholder: () => "text-muted-foreground text-sm",
                      input: () => "text-sm m-0 p-0",
                      menu: () => "z-50 rounded-md border border-input bg-background shadow-md",
                      menuList: () => "py-1",
                      option: ({ isFocused }) =>
                        cn("px-3 py-2 text-sm cursor-pointer", isFocused && "bg-accent"),
                      singleValue: () => "text-sm",
                      clearIndicator: () => "text-muted-foreground hover:text-foreground cursor-pointer px-1",
                      indicatorSeparator: () => "hidden",
                      dropdownIndicator: () => "hidden",
                    }}
                    styles={{
                      menuList: (base) => ({
                        ...base,
                        maxHeight: isMobile ? '50px' : '192px',
                        overflowY: 'auto',
                      }),
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* 担当者名 */}
            <Controller
              name="staff_name"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>担当者名</FieldLabel>
                  <AsyncCreatableSelect<StaffOption>
                    key={selectedSalonId ?? (watchedSalonName ? `new-${watchedSalonName}` : 'none')}
                    inputId={field.name}
                    value={field.value ? { value: field.value, label: field.value } : null}
                    onChange={(option) => {
                      field.onChange(option?.value ?? null);
                      if (option?.salonName) {
                        setValue("salon_name", option.salonName);
                        setSelectedSalonId(option.salonId ?? null);
                      }
                      trigger(field.name);
                    }}
                    onBlur={field.onBlur}
                    loadOptions={loadStaffOptions}
                    defaultOptions
                    cacheOptions
                    isClearable
                    placeholder="担当者名を入力または選択"
                    formatCreateLabel={(input) => `「${input}」を追加`}
                    noOptionsMessage={() => "候補がありません"}
                    unstyled
                    menuShouldBlockScroll
                    classNames={{
                      control: ({ isFocused }) =>
                        cn(
                          "flex w-full items-center rounded-md border border-input bg-background px-3 text-sm ring-offset-background",
                          isFocused && "outline-none ring-2 ring-ring ring-offset-2",
                        ),
                      valueContainer: () => "flex-1 p-0 gap-1",
                      placeholder: () => "text-muted-foreground text-sm",
                      input: () => "text-sm m-0 p-0",
                      menu: () => "z-50 rounded-md border border-input bg-background shadow-md",
                      menuList: () => "py-1",
                      option: ({ isFocused }) =>
                        cn("px-3 py-2 text-sm cursor-pointer", isFocused && "bg-accent"),
                      singleValue: () => "text-sm",
                      clearIndicator: () => "text-muted-foreground hover:text-foreground cursor-pointer px-1",
                      indicatorSeparator: () => "hidden",
                      dropdownIndicator: () => "hidden",
                    }}
                    styles={{
                      menuList: (base) => ({
                        ...base,
                        maxHeight: isMobile ? '50px' : '192px',
                        overflowY: 'auto',
                      }),
                    }}
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
