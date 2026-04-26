import { logSchema } from "@/features/log/schema";
import { describe, test, expect } from "vitest";

function createFileList(files: File[]): FileList {
    const fileList = Object.create(FileList.prototype) as FileList;
    files.forEach((file, i) => Object.defineProperty(fileList, i, { value: file }));
    Object.defineProperty(fileList, "length", { value: files.length });
    return fileList;
}

describe("logSchema", () => {
    const validBase = {
        category: "hair",
        title: "テスト",
        detail: null,
        cost: 5000,
        done_at: new Date("2026-04-01"),
        salon_name: null,
        staff_name: null,
    };

    test("正常データはバリデーションを通る", () => {
        expect(logSchema.safeParse(validBase).success).toBe(true);
    });

    test("タイトルが51文字でエラーになる", () => {
        const result = logSchema.safeParse({ ...validBase, title: "あ".repeat(51) });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("50文字以内で入力してください");
    });

    test("詳細メモが201文字でエラーになる", () => {
        const result = logSchema.safeParse({ ...validBase, detail: "あ".repeat(201) });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("200文字以内で入力してください");
    });

    test("金額が小数でエラーになる", () => {
        const result = logSchema.safeParse({ ...validBase, cost: 1.5 });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("整数で入力してください");
    });

    test("金額が負数でエラーになる", () => {
        const result = logSchema.safeParse({ ...validBase, cost: -1 });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("0以上の金額を入力してください");
    });

    test("実施日がundefinedでエラーになる", () => {
        const result = logSchema.safeParse({ ...validBase, done_at: undefined });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("実施日を入力してください");
    });

    test("画像サイズが10MB超でエラーになる", () => {
        const file = new File(["x"], "photo.jpg", { type: "image/jpeg" });
        Object.defineProperty(file, "size", { value:  11 * 1024 * 1024 });
        const result = logSchema.safeParse({ ...validBase, before_photo_url: createFileList([file]) });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("ファイルサイズは最大10MBです");
    });

    test("非画像ファイルでエラーになる", () => {
        const file = new File(["content"], "document.pdf", { type: "application/pdf" });
        const result = logSchema.safeParse({ ...validBase, before_photo_url: createFileList([file]) });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("画像ファイル（JPEG・PNG・GIF等）を選択してください");
    });
});
