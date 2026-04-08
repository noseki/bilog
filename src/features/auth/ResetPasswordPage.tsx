import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { resetPasswordSchema, type ResetPasswordValues } from './schema'
import { supabase } from "@/lib/supabase/client";
import { Link } from "react-router-dom";
import { Button } from '@/components/ui/button'

export const ResetPasswordPage = () => {
    const [error, setError] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async ({ email }: ResetPasswordValues) => {
        try {
            setError("");

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });
            if (error) throw new Error();
            setIsComplete(true);
        } catch (error) {
            setError("メールの送信に失敗しました。再度お試しください。");
        }
    };

    if (isComplete) {
        return (
            <div>
                <h1>メールを送信しました</h1>
                <p>パスワード再設定用のリンクをメールに送信しました。</p>
                <p>メール内のリンクからパスワードを再設定してください。</p>
            </div>
        );
    }

    return (
        <div>
            <div>
                <h1>パスワード再設定</h1>
            </div>

            {error && <div className="text-red-500">{error}</div>}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor="email">メールアドレス</label>
                    <input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="example@email.com"
                        disabled={isSubmitting}
                    />
                    {errors.email && (
                        <p className="text-red-500">{errors.email.message};</p>
                    )}
                </div>
                <Button disabled={isSubmitting}>
                    {isSubmitting ? "メール送信中..." : "パスワードを再設定する"}
                </Button>
            </form>

            <div>
                <Link to="/login">ログイン画面に戻る</Link>
            </div>
        </div>

    );
};
