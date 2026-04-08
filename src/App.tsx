import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./features/HomePage";
// import { TimelinePage } from './features/timeline/TimelinePage'
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { ResetPasswordPage } from "./features/auth/ResetPasswordPage";
import { LoginPage } from "./features/auth/LoginPage";
import { SignUpPage } from "./features/auth/SignUpPage";
import { UpdatePasswordPage } from "./features/auth/UpdatePasswordPage";

// 未ログインならloginへリダイレクト
const ProtectedRoute = ({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) => {
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ログイン済みならhomeへリダイレクト
const PublicRoute = ({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) => {
  if (session) return <Navigate to="/home" replace />;
  return <>{children}</>;
};

export const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session),
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <p>読み込み中...</p>;

  return (
    <Routes>
      {/* 未ログインのみアクセス可 */}
      <Route
        path="/login"
        element={
          <PublicRoute session={session}>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute session={session}>
            <SignUpPage />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute session={session}>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />
      <Route path="/update-password" element={<UpdatePasswordPage />} />

      {/* ログイン済みのみアクセス可 */}
      <Route
        path="/home"
        element={
          <ProtectedRoute session={session}>
            <HomePage session={session!} />
          </ProtectedRoute>
        }
      />

      {/* <Route
        path="/timeline"
        element={
          <ProtectedRoute session={session}>
            <TimelinePage />
          </ProtectedRoute>
        }
      /> */}

      {/* それ以外はセッション状態に応じてリダイレクト */}
      <Route
        path="*"
        element={<Navigate to={session ? "/home" : "/login"} replace />}
      />
    </Routes>
  );
};
