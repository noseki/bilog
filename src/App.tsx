import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./features/home/HomePage";
import { ResetPasswordPage } from "./features/auth/ResetPasswordPage";
import { LoginPage } from "./features/auth/LoginPage";
import { SignUpPage } from "./features/auth/SignUpPage";
import { UpdatePasswordPage } from "./features/auth/UpdatePasswordPage";
import { LogTimelinePage } from "./features/log/LogTimelinePage";
import { Layout } from "./components/layout/Layout";
import { AddLogPage } from "./features/log/AddLogPage";
import { LogDetailPage } from "./features/log/LogDetailPage";
import { EditLogPage } from "./features/log/EditLogPage";
import { useAuth } from "./features/auth/context/useAuth";
import { AuthProvider } from "./features/auth/context/AuthProvider";

// 未ログインならloginへリダイレクト
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const session = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ログイン済みならhomeへリダイレクト
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const session = useAuth();
  if (session) return <Navigate to="/home" replace />;
  return <>{children}</>;
};

const CatchAll = () => {
  const session = useAuth();
  return <Navigate to={session ? "/home" : "/login"} replace />;
};

export const App = () => {
  return (
    <AuthProvider>
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
          <Route path="/log-timeline/:id" element={<LogDetailPage />} />
          <Route path="/log-timeline/:id/edit" element={<EditLogPage />} />
          <Route path="/add-log" element={<AddLogPage />} />
        </Route>

        <Route path="*" element={<CatchAll />} />
      </Routes>
    </AuthProvider>
  );
};
