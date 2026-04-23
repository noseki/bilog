import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Link } from "react-router-dom";
import { signUpSchema, type SignUpValues } from "../schema";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const SignUpPage = () => {
    const [error, setError] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpValues>({
        resolver: zodResolver(signUpSchema),
    });

    const onSubmit = async ({ email, password }: SignUpValues) => {
        try {
        setError("");
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
            emailRedirectTo: `${window.location.origin}/login`,
            },
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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
            <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-indigo-600">Bilog</h1>
            </div>
            <Card className="w-full max-w-sm">
            <CardHeader className="mb-4">
                <CardTitle>確認メールを送信しました</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>登録したメールアドレスに確認メールを送信しました。</p>
                <p>メール内のリンクをクリックして登録を完了してください。</p>
            </CardContent>
            <CardFooter>
                <Link to="/login" className="text-sm text-indigo-600 hover:underline">
                    ログイン画面へ
                </Link>
            </CardFooter>
            </Card>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-indigo-600">Bilog</h1>
            <p className="mt-1 text-sm text-muted-foreground">美容記録・予算管理アプリ</p>
        </div>

        <Card className="w-full max-w-sm">
            <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="mb-4">
                <CardTitle>新規登録</CardTitle>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </CardHeader>

            <CardContent>
                <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="example@email.com"
                    disabled={isSubmitting}
                    />
                    {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">パスワード</Label>
                    <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    placeholder="8文字以上、半角英数字混合"
                    disabled={isSubmitting}
                    />
                    {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">パスワード（確認）</Label>
                    <Input
                    id="confirmPassword"
                    type="password"
                    {...register("confirmPassword")}
                    placeholder="パスワードをもう一度入力"
                    disabled={isSubmitting}
                    />
                    {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                    )}
                </div>
                </div>
            </CardContent>

            <CardFooter className="flex-col gap-3">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "登録中..." : "登録する"}
                </Button>
                <Link to="/login" className="text-sm text-indigo-600 hover:underline">
                すでにアカウントをお持ちの方はこちら
                </Link>
            </CardFooter>
            </form>
        </Card>
        </div>
    );
};
