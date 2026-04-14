import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Link } from 'react-router-dom';
import { signUpSchema, type SignUpValues } from './schema'
import { Button } from '@/components/ui/button'

export const SignUpPage = () => {
    const [error, setError] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);

    // react-hook-formのセットアップ
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpValues>({
        // zodResolverでzodスキーマをバリデーションに使用
        resolver: zodResolver(signUpSchema),
    });

    //  ログインボタン押下時
    const onSubmit = async ({ email, password }: SignUpValues) => {
        try {
            setError("");

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    // メールで送信されるURLのリダイレクト先
                    emailRedirectTo: `${window.location.origin}/login`
                }
            });
            if (error) throw new Error();
            setIsComplete(true);
        } catch (error) {
            console.error(`SignUpPage onSubmit Error: ${error}`);
            setError("登録に失敗しました。再度お試しください。");
        }
    };

    if (isComplete) {
        return (
        <div>
            <h1>確認メールを送信しました</h1>
            <p>{`登録したメールアドレスに確認メールを送信しました。`}</p>
            <p>メール内のリンクをクリックして登録を完了してください。</p>
        </div>
        )
    }

    return (
        <div>
            <div>
                <h1>新規登録</h1>
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

                <div>
                    <label htmlFor="password">パスワード</label>
                    <input
                        id="password"
                        type="password"
                        {...register("password")}
                        placeholder="パスワード(8文字以上、半角英数字混合)を入力"
                        disabled={isSubmitting}
                    />
                    {errors.password && (
                        <p className="text-red-500">{errors.password.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="confirmPassword">パスワード（確認）</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        {...register('confirmPassword')}
                        placeholder="パスワードをもう一度入力"
                        disabled={isSubmitting}
                    />
                    {errors.confirmPassword && (
                        <p className="text-red-500">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "登録中..." : "登録"}
                </Button>
            </form>

            <div>
                <Link to="/login">ユーザー登録済みの方はこちら</Link>
            </div>
        </div>
    );
};

