import { z } from "zod";

const emailField = z.email("有効なメールアドレスを入力してください");

const passwordField =z
        .string()
        .min(8, 'パスワードは8文字以上で入力してください')
        .regex(
            /^(?=.*?[a-z])(?=.*?\d)[a-z\d]{8,100}$/i,
            'パスワードは半角英数字混合で入力してください'
        );

const loginPasswordField = z.string().min(1, "パスワードを入力してください");

const confirmPasswordField = z.string().min(1, '確認用のパスワードを入力してください');

export const loginSchema = z.object({
    email: emailField,
    password: loginPasswordField,
});

export const signUpSchema = z.object({
    email: emailField,
    password: passwordField,
    confirmPassword: confirmPasswordField,
})
.refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'] // エラーを表示するフィールドを指定
});

export const resetPasswordSchema = z.object({
    email: emailField,
});

export const updatePasswordSchema = z.object({
    password: passwordField,
    confirmPassword: confirmPasswordField,
}).refine(
    (data) => data.password === data.confirmPassword,
    { message: 'パスワードが一致しません', path: ['confirmPassword'] }
);

export type LoginValues = z.infer<typeof loginSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;
