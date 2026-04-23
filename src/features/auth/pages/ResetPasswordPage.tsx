import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { resetPasswordSchema, type ResetPasswordValues } from "../schema";
import { supabase } from "@/lib/supabase/client";
import { Link } from "react-router-dom";
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
        console.error(`ResetPasswordPage onSubmit Error: ${error}`);
        setError("メールの送信に失敗しました。再度お試しください。");
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
                    <CardTitle>メールを送信しました</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>パスワード再設定用のリンクをメールに送信しました。</p>
                    <p>メール内のリンクからパスワードを再設定してください。</p>
                </CardContent>
                <CardFooter>
                    <Link to="/login" className="text-sm text-indigo-600 hover:underline">
                    ログイン画面に戻る
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
                    <CardTitle>パスワードをお忘れですか？</CardTitle>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </CardHeader>

                <CardContent>
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
                </CardContent>

                <CardFooter className="flex-col gap-3">
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "メール送信中..." : "パスワードを再設定する"}
                    </Button>
                    <Link to="/login" className="text-sm text-indigo-600 hover:underline">
                    ログイン画面に戻る
                    </Link>
                </CardFooter>
                </form>
            </Card>
        </div>
    );
};
