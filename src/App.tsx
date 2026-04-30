import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { HomePage } from "./features/home/pages/HomePage";
import { ResetPasswordPage } from "./features/auth/pages/ResetPasswordPage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { SignUpPage } from "./features/auth/pages/SignUpPage";
import { UpdatePasswordPage } from "./features/auth/pages/UpdatePasswordPage";
import { LogTimelinePage } from "./features/log/pages/LogTimelinePage";
import { Layout } from "./components/layout/Layout";
import { AddLogPage } from "./features/log/pages/AddLogPage";
import { LogDetailPage } from "./features/log/pages/LogDetailPage";
import { EditLogPage } from "./features/log/pages/EditLogPage";
import { useAuth } from "./features/auth/hooks/useAuth";
import { AuthProvider } from "./features/auth/hooks/AuthProvider";
import { ManageBudgetPage } from "./features/budget/pages/ManageBudgetPage";
import { AddBudgetPage } from "./features/budget/pages/AddBudgetPage";
import { EditBudgetPage } from "./features/budget/pages/EditBudgetPage";

// 未ログインならloginへリダイレクト
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const session = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ログイン済みならhomeへリダイレクト（パスワード再設定中はスキップ）
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const session = useAuth();
  const isRecoveryMode = localStorage.getItem("bilog:recoveryMode") === "true";
  if (session && !isRecoveryMode) return <Navigate to="/home" replace />;
  return <>{children}</>;
};

// 画面変更時にトップ位置へスクロール
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const CatchAll = () => {
  const session = useAuth();
  return <Navigate to={session ? "/home" : "/login"} replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUpPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />
        <Route path="/update-password" element={<UpdatePasswordPage />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<HomePage />} />
          <Route path="/log-timeline" element={<LogTimelinePage />} />
          <Route path="/log-timeline/add" element={<AddLogPage />} />
          <Route path="/log-timeline/:id" element={<LogDetailPage />} />
          <Route path="/log-timeline/:id/edit" element={<EditLogPage />} />
          <Route path="/manage-budget" element={<ManageBudgetPage />} />
          <Route path="/manage-budget/add" element={<AddBudgetPage />} />
          <Route path="/manage-budget/:id/edit" element={<EditBudgetPage />} />
        </Route>

        <Route path="*" element={<CatchAll />} />
      </Routes>
    </AuthProvider>
  );
};
