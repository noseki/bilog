import { z } from "zod";

const MAX_IMAGE_SIZE = 10; // 10MB

// バイト単位のサイズをメガバイト単位に変換する
const sizeInMB = (sizeInBytes: number, decimalsNum = 2) => {
    const result = sizeInBytes / (1024 * 1024);
    return +result.toFixed(decimalsNum);
};

export const logSchema = z.object({
    category: z.string().min(1, { message: "カテゴリーを選択してください" }),
    title: z.string().min(1, { message: "タイトルを入力してください" }).max(50, '50文字以内で入力してください'),
    detail: z.string().max(200, '200文字以内で入力してください').nullable(),
    cost: z.number().int('整数で入力してください').min(0, { message: "0以上の金額を入力してください" }),
    done_at: z.date({ message: "実施日を入力してください" }),
    before_photo_url: z.instanceof(FileList)
        .optional()
        .refine((files) => !files || files.length === 0 || sizeInMB(files[0].size) <= MAX_IMAGE_SIZE,
            { message: 'ファイルサイズは最大10MBです' }
        )
        .refine(
            (files) => !files || files.length === 0 || files[0].type.startsWith("image/"),
            { message: "画像ファイル（JPEG・PNG・GIF等）を選択してください" }
        ),
    after_photo_url: z.instanceof(FileList)
        .optional()
        .refine((files) => !files || files.length === 0 || sizeInMB(files[0].size) <= MAX_IMAGE_SIZE,
            { message: 'ファイルサイズは最大5MBです' }
        )
        .refine(
            (files) => !files || files.length === 0 || files[0].type.startsWith("image/"),
            { message: "画像ファイル（JPEG・PNG・GIF等）を選択してください" }
        ),
    salon_name: z.string().max(50, '50文字以内で入力してください').nullable(),
    staff_name: z.string().max(50, '50文字以内で入力してください').nullable(),
});

export type LogValues = z.infer<typeof logSchema>;
