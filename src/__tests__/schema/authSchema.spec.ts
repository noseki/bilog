import { loginSchema, resetPasswordSchema, signUpSchema, updatePasswordSchema } from "@/features/auth/schema";
import { describe, test, expect } from "vitest";

describe("loginSchema", () => {
    const validBase = {
        email: "test@example.com",
        password: "password123"
    };

    test("正常データはバリデーションを通る", () => {
        expect(loginSchema.safeParse(validBase).success).toBe(true);
    });

    test("emailが不正な形式でエラーになる", () => {
        const result = loginSchema.safeParse({ ...validBase, email: "test" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("有効なメールアドレスを入力してください");
    });

    test("パスワードが空でエラーになる", () => {
        const result = loginSchema.safeParse({ ...validBase, password: "" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("パスワードを入力してください");
    });
});

describe('signUpSchema', () => {
    const validBase = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
    };

    test("正常データはバリデーションを通る", () => {
        expect(signUpSchema.safeParse(validBase).success).toBe(true);
    });

    test("emailが不正な形式でエラーになる", () => {
        const result = signUpSchema.safeParse({ ...validBase, email: "test" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("有効なメールアドレスを入力してください");
    });

    test("パスワードが8文字未満でエラーになる", () => {
        const result = signUpSchema.safeParse({ ...validBase, password: "passwor" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("パスワードは8文字以上で入力してください");
    });

    test("パスワードが半角英数字混合でないとエラーになる", () => {
        const result = signUpSchema.safeParse({ ...validBase, password: "password" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("パスワードは半角英数字混合で入力してください");
    });

    test("確認用パスワードが空でエラーになる", () => {
        const result = signUpSchema.safeParse({ ...validBase, confirmPassword: "" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("確認用のパスワードを入力してください");
    });

    test("パスワードと確認用パスワードが一致しないとエラーになる", () => {
        const result = signUpSchema.safeParse({ ...validBase, confirmPassword: "password" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("パスワードが一致しません");
    });
});

describe("resetPasswordSchema", () => {
    const validBase = {
        email: "test@example.com",
    };

    test("正常データはバリデーションを通る", () => {
        expect(resetPasswordSchema.safeParse(validBase).success).toBe(true);
    });

    test("emailが不正な形式でエラーになる", () => {
        const result = resetPasswordSchema.safeParse({ ...validBase, email: "test" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("有効なメールアドレスを入力してください");
    });
});

describe('updatePasswordSchema', () => {
    const validBase = {
        password: "password123",
        confirmPassword: "password123",
    };

    test("正常データはバリデーションを通る", () => {
        expect(updatePasswordSchema.safeParse(validBase).success).toBe(true);
    });

    test("パスワードが8文字未満でエラーになる", () => {
        const result = updatePasswordSchema.safeParse({ ...validBase, password: "passwor" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("パスワードは8文字以上で入力してください");
    });

    test("パスワードが半角英数字混合でないとエラーになる", () => {
        const result = updatePasswordSchema.safeParse({ ...validBase, password: "password" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("パスワードは半角英数字混合で入力してください");
    });

    test("確認用パスワードが空でエラーになる", () => {
        const result = updatePasswordSchema.safeParse({ ...validBase, confirmPassword: "" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("確認用のパスワードを入力してください");
    });

    test("パスワードと確認用パスワードが一致しないとエラーになる", () => {
        const result = updatePasswordSchema.safeParse({ ...validBase, confirmPassword: "password" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("パスワードが一致しません");
    });
});
