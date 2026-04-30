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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async ({ email, password }: LoginValues) => {
    try {
      setError("");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error("LoginPage onSubmit Error:", error);
      setError("メールアドレスまたはパスワードが正しくありません");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-indigo-600">Bilog</h1>
        <p className="mt-1 text-sm text-muted-foreground">美容記録・予算管理アプリ</p>
      </div>

      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader className="mb-4">
            <CardTitle>ログイン</CardTitle>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardHeader>

          <CardContent className="mb-4">
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
                <div className="flex items-center">
                  <Label htmlFor="password">パスワード</Label>
                  <Link
                    to="/reset-password"
                    className="ml-auto text-xs text-indigo-600 hover:underline"
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
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "ログイン中..." : "ログイン"}
            </Button>
            <Link to="/signup" className="text-sm text-indigo-600 hover:underline">
              アカウントをお持ちでない方はこちら
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
