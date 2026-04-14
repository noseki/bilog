import { zodResolver } from "@hookform/resolvers/zod";
import { updatePasswordSchema, type UpdatePasswordValues } from './schema'
import { useForm } from "react-hook-form";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button'

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
        throw new Error();
      }
      navigate("/login", {
        state: { referrer: "login" },
      });
    } catch (error) {
      console.error(`UpdatePasswordPage onSubmit Error: ${error}`);
      setError("パスワードの更新に失敗しました。再度お試しください。");
    }
  };

  return (
    <div>
      <div>
        <h1>パスワード再設定</h1>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="password">新規パスワード</label>
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
          <label htmlFor="confirmPassword">新規パスワード（確認）</label>
          <input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            placeholder="パスワードをもう一度入力"
            disabled={isSubmitting}
          />
          {errors.confirmPassword && (
            <p className="text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "更新中..." : "パスワードを更新する"}
        </Button>
      </form>
    </div>
  );
};
