import type { LogValues } from "@/features/log/schema";
import { supabase } from "../lib/supabase/client";
import type { Tables } from '@/types/supabase';
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

export const createLog = async ({
        userId,
        formData,
        photoUrls,
    }: {
        userId: string;
        formData: LogValues;
        photoUrls: { before: string | null, after: string | null };
    }): Promise<Log> => {
        // salon_nameがあればsalonsテーブルにupsert（salon_idも取得）
        let salonId: string | null = null;
        if (formData.salon_name) {
            const { data: salonData, error: salonError } = await supabase
                .from("salons")
                .upsert({ name: formData.salon_name, user_id: userId }, { onConflict: 'user_id, name' })
                .select("id")
                .single();

            if (salonError) throw new Error(`insertSalon error: ${salonError.message}`);
            salonId = salonData.id;
        }

        // staff_nameおよびsalon_idがあればstaffsテーブルにupsert
        if (formData.staff_name && salonId ) {
            const { error: staffError } = await supabase
                .from("staffs")
                .upsert({ name: formData.staff_name, salon_id: salonId, user_id: userId }, { onConflict: "user_id, name, salon_id" });

            if (staffError) throw new Error(`insertStaff error: ${staffError.message}`);
        }

        // logsテーブルにinsert
        const { data: logData, error: logError } = await supabase
            .from("logs")
            .insert({
                user_id: userId,
                category: formData.category,
                title: formData.title,
                detail: formData.detail,
                cost: formData.cost,
                done_at: formatLocalDate(formData.done_at), // Date → "YYYY-MM-DD" 文字列に変換
                salon_name: formData.salon_name,
                staff_name: formData.staff_name,
                before_photo_url: photoUrls.before,
                after_photo_url: photoUrls.after,
            })
            .select()
            .single();

        if (logError) throw new Error(`insertLog error: ${logError.message}`);
        return logData;
}

export const deleteLog = async (id: string) => {
    const { error } = await supabase
        .from("logs")
        .delete()
        .eq("id", id);

    if (error) throw new Error(`deleteLog error: ${error.message}`);
}
