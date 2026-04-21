import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Link } from "react-router-dom";
import { loginSchema, type LoginValues } from "../schema";
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

export const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);

  // react-hook-formのセットアップ
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    // zodResolverでzodスキーマをバリデーションに使用
    resolver: zodResolver(loginSchema),
  });

  //  ログインボタン押下時
  const onSubmit = async ({ email, password }: LoginValues) => {
    try {
      setError("");
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error();
    } catch (error) {
      console.error(`LoginPage onSubmit Error: ${error}`);
      setError("メールアドレスまたはパスワードが正しくありません");
      // 成功時はApp.tsxのonAuthStateChangeが自動でリダイレクト
    }
  };

  return (
    <Card className="relative my-8 mx-auto w-full max-w-sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
          {error && <div className="text-red-500">{error}</div>}
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-6">
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
                <p className="text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">パスワード</Label>
                <Link
                  to="/reset-password"
                  className="text-blue-500 ml-auto inline-block text-xs underline-offset-4 hover:underline"
                >
                  パスワードをお忘れですか？
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="パスワードを入力"
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-red-500">{errors.password.message}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "ログイン中..." : "ログイン"}
          </Button>
          <Link to="/signup" className="text-blue-500 hover:underline">
            ユーザー登録がお済みでない方
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
};
