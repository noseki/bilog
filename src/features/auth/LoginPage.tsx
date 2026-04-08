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
import { useForm } from "react-hook-form";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Link } from "react-router-dom";
import { loginSchema, type LoginValues } from './schema'
import { Button } from '@/components/ui/button'

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

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error();
    } catch (error) {
      setError("メールアドレスまたはパスワードが正しくありません");
      // 成功時はApp.tsxのonAuthStateChangeが自動でリダイレクト
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
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password">パスワード</label>
          <input
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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "ログイン中..." : "ログイン"}
        </Button>
      </form>

      <div>
        <Link to="/signup">ユーザー登録がお済みでない方はこちら</Link>
      </div>
      <div>
        <Link to="/reset-password">パスワードをお忘れの方はこちら</Link>
      </div>
    </div>
  );
};
