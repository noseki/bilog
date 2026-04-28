import { zodResolver } from "@hookform/resolvers/zod";
import { updatePasswordSchema, type UpdatePasswordValues } from "../schema";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useNavigate } from "react-router-dom";
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

export const UpdatePasswordPage = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmit = async ({ password }: UpdatePasswordValues) => {
    try {
      setError("");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        console.log(error);
        throw error;
      }
      navigate("/login", { state: { referrer: "login" } });
    } catch (error) {
      console.error(`UpdatePasswordPage onSubmit Error: ${error}`);
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("same password") || message.includes("different from the old password")) {
        setError("以前と同じパスワードは使用できません。別のパスワードを設定してください。");
      } else {
        setError("パスワードの更新に失敗しました。再度お試しください。");
      }
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
            <CardTitle>パスワード再設定</CardTitle>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">新規パスワード</Label>
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
                <Label htmlFor="confirmPassword">新規パスワード（確認）</Label>
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

          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "更新中..." : "パスワードを更新する"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
