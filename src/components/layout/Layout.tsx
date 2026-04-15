import { Link, Outlet, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "../ui/button";
import { useAuth } from "@/features/auth/context/useAuth";

export const Layout = () => {
  const navigate = useNavigate();
  const session = useAuth();

  const onLogout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-16">
              {/* ロゴ */}
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-indigo-600">
                  Bilog
                </span>
              </Link>

              {/* ナビゲーション（スマホでは非表示） */}
              <nav className="hidden md:flex space-x-8">
                <Link
                  to="/log-timeline"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  記録一覧
                </Link>
                <Link
                  to="/#"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  予算管理
                </Link>
              </nav>
            </div>

            {/* 右側のアクション */}
            <div className="flex items-center space-x-4">
              <p className="hidden md:flex">{session?.user.email}</p>
              <Button onClick={onLogout}>ログアウト</Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* フッター */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            &copy; 2026 Bilog. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
