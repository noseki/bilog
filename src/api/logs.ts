import type { LogValues } from "@/features/log/schema";
import { supabase } from "../lib/supabase/client";
import type { Tables } from "@/types/supabase";
import { formatLocalDate } from "@/utils/log";

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

// salon / staff の upsert を共通化
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

  // 表示用に新鮮なsignedURL（1時間有効）を生成して上書き
  const [before, after] = await Promise.all([
    toSignedUrl(data.before_photo_url),
    toSignedUrl(data.after_photo_url),
  ]);
  return { ...data, before_photo_url: before, after_photo_url: after };
};

export const deleteLog = async (id: string) => {
  const { error } = await supabase.from("logs").delete().eq("id", id);

  if (error) throw new Error(`deleteLog error: ${error.message}`);
};
