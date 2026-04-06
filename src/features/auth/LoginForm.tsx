// import { cn } from '@/lib/utils'
// import { createClient } from '@/lib/supabase/client'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { useState } from 'react'

// export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState<string | null>(null)
//   const [isLoading, setIsLoading] = useState(false)

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)
//     setError(null)
//     const supabase = createClient()

//     try {
//       const { error } = await supabase.auth.signInWithPassword({ email, password })
//       if (error) throw error
//       location.href = '/timeline'  // ログイン後の遷移先
//     } catch (error: unknown) {
//       setError(error instanceof Error ? error.message : 'エラーが発生しました')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className={cn('flex flex-col gap-6', className)} {...props}>
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-2xl">Bilog</CardTitle>
//           <CardDescription>メールアドレスとパスワードでログイン</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleLogin}>
//             <div className="flex flex-col gap-6">
//               <div className="grid gap-2">
//                 <Label htmlFor="email">メールアドレス</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="example@email.com"
//                   required
//                   value={email}
//                   onChange={e => setEmail(e.target.value)}
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="password">パスワード</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   required
//                   value={password}
//                   onChange={e => setPassword(e.target.value)}
//                 />
//               </div>
//               {error && <p className="text-sm text-red-500">{error}</p>}
//               <Button type="submit" className="w-full" disabled={isLoading}>
//                 {isLoading ? 'ログイン中...' : 'ログイン'}
//               </Button>
//             </div>
//             <div className="mt-4 text-center text-sm">
//               アカウントをお持ちでない方は{' '}
//               <a href="/signup" className="underline underline-offset-4">新規登録</a>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";


const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [error, setError] = useState<string | null>(null);

  // react-hook-formのセットアップ
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    // zodResolverでzodスキーマをバリデーションに使用
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  //  ログインボタン押下時
  const onSubmit = async (formData: LoginFormData) => {
    try {
      setError("");

      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) throw new Error();
    } catch (error) {
      setError("メールアドレスまたはパスワードが正しくありません");
    }
  };

  return (
    <div>
      <div>
        <h1>ログイン</h1>
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
            placeholder="パスワードを入力"
          />
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "ログイン中..." : "ログイン"}
          </button>
        </div>
      </form>

      <div>
        ユーザー登録がお済みでない方は
        <a href="#">こちら</a>
      </div>

      <div>
        パスワードをお忘れの方は
        <a href="#">こちら</a>
      </div>
    </div>
  );
};
