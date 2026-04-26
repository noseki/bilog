import type { LogValues } from "@/features/log/schema";
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/types/supabase";
import { formatLocalDate } from "@/features/log/utils/log";

type Log = Tables<"logs">;

export const fetchLogs = async (userId: string) => {
  const { data, error } = await supabase
    .from("logs")
    .select("*")
    .eq("user_id", userId)
    .order("done_at", { ascending: false }) // 最新順
    .order("created_at", { ascending: false });

  if (error) throw new Error(`fetchLogs error: ${error.message}`);
  return data;
};

type LogPayload = {
  userId: string;
  formData: LogValues;
  photoUrls: { before: string | null; after: string | null };
};

// salonsとstaffsのupsertを共通化
async function upsertSalonAndStaff(
  userId: string,
  formData: LogValues,
): Promise<string | null> {
  if (!formData.salon_name) return null;

  const { data: salonsData, error: salonsError } = await supabase
    .from("salons")
    .upsert(
      { name: formData.salon_name, user_id: userId },
      { onConflict: "user_id, name" },
    )
    .select("id")
    .single();
  if (salonsError) throw new Error(`upsertSalon error: ${salonsError.message}`);

  const salonId = salonsData.id;
  if (formData.staff_name) {
    const { error: staffsError } = await supabase
      .from("staffs")
      .upsert(
        { name: formData.staff_name, salon_id: salonId, user_id: userId },
        { onConflict: "user_id, name, salon_id" },
      );
    if (staffsError)
      throw new Error(`upsertStaff error: ${staffsError.message}`);
  }
  return salonId;
}

export const createLog = async ({
  userId,
  formData,
  photoUrls,
}: LogPayload): Promise<Log> => {
  await upsertSalonAndStaff(userId, formData);

  const { data, error } = await supabase
    .from("logs")
    .insert({
      user_id: userId,
      category: formData.category,
      title: formData.title,
      detail: formData.detail,
      cost: formData.cost,
      done_at: formatLocalDate(formData.done_at),
      salon_name: formData.salon_name,
      staff_name: formData.staff_name,
      before_photo_url: photoUrls.before,
      after_photo_url: photoUrls.after,
    })
    .select()
    .single();

  if (error) throw new Error(`createLog error: ${error.message}`);
  return data;
};

export const updateLog = async ({
  logId,
  userId,
  formData,
  photoUrls,
}: LogPayload & { logId: string }): Promise<Log> => {
  await upsertSalonAndStaff(userId, formData);

  const { data, error } = await supabase
    .from("logs")
    .update({
      category: formData.category,
      title: formData.title,
      detail: formData.detail,
      cost: formData.cost,
      done_at: formatLocalDate(formData.done_at),
      salon_name: formData.salon_name,
      staff_name: formData.staff_name,
      before_photo_url: photoUrls.before,
      after_photo_url: photoUrls.after,
    })
    .eq("id", logId)
    .select()
    .single();

  if (error) throw new Error(`updateLog error: ${error.message}`);
  return data;
};

// 画像ファイルパスから有効なsigned URLを生成する
async function toSignedUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from("images")
    .createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}

// 特定のid(logs.id)からlog情報を取得
export const fetchLog = async (id: string) => {
  const { data, error } = await supabase
    .from("logs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(`fetchLog error: ${error.message}`);

  const beforePath = data.before_photo_url;
  const afterPath = data.after_photo_url;

  // 表示用に新鮮なsignedURL（1時間有効）を生成して上書き
  const [before, after] = await Promise.all([
    toSignedUrl(beforePath),
    toSignedUrl(afterPath),
  ]);
  return {
    ...data,
    before_photo_url: before,    // 表示用 signed URL
    after_photo_url: after,       // 表示用 signed URL
    before_photo_path: beforePath, // 保存用の生パス
    after_photo_path: afterPath,   // 保存用の生パス
  };
};

export const deleteLog = async (id: string) => {
  const { error } = await supabase.from("logs").delete().eq("id", id);

  if (error) throw new Error(`deleteLog error: ${error.message}`);
};

// 美容履歴用ログ取得
export const fetchLogsWithAfterPhotos = async (userId: string) => {
  const logs = await fetchLogs(userId);

  // After写真が存在するログを取得
  const logsWithPhotos = logs.filter((log) => log.after_photo_url != null);
  if (logsWithPhotos.length === 0) return logsWithPhotos;

  // After写真のファイルパスから署名URL生成
  const paths = logsWithPhotos.map((log) => log.after_photo_url as string);
  const { data: signedData } = await supabase.storage
    .from("images")
    .createSignedUrls(paths, 3600);

  const urlMap = new Map(
    signedData?.map((data) => [data.path, data.signedUrl]) ?? [],
  );

  return logsWithPhotos.map((log) => ({
    ...log,
    after_photo_url: urlMap.get(log.after_photo_url) ?? null,
  }));
};

// 特定の年月(yearMonth: "YYYY-MM")のログ取得
export const fetchLogsByYearMonth = async (userId: string, yearMonth: string): Promise<Log[]> => {
    const [year, month] = yearMonth.split("-").map(Number);

    const start = `${yearMonth}-01`;
    // 12月であれば翌年1月
    const nextMonth = month === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 1).padStart(2, "0")}-01`;

    const { data, error } = await supabase
        .from("logs")
        .select("*")
        .eq("user_id", userId)
        .gte("done_at", start)
        .lt("done_at", nextMonth);

    if (error) throw new Error(`fetchLogsByYearMonth error: ${error.message}`);
    return data;
};
