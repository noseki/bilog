import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "../ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Toaster } from "../ui/sonner";
import { ClipboardList, House, Menu, WalletCards, X } from "lucide-react";

const navigation = [
    { name: "ホーム", path: "/home", icon: <House /> },
    { name: "記録一覧", path: "/log-timeline", icon: <ClipboardList /> },
    { name: "予算管理", path: "/manage-budget", icon: <WalletCards /> },
];

export const Layout = () => {
  const navigate = useNavigate();
  const session = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* モバイル用サイドバー（オーバーレイ） */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* バックドロップ */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          {/* サイドバー本体 */}
          <aside className="relative w-50 h-full bg-gray-900 text-white flex flex-col z-50">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h1 className="text-xl font-bold text-indigo-400">Bilog</h1>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-indigo-300 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`
                  }
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
              Bilog v1.0
            </div>
          </aside>
        </div>
      )}

      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {/* ハンバーガーボタン（モバイルのみ） */}
              <button
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="メニューを開く"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>

              {/* ロゴ */}
              <Link to="/home" className="flex items-center">
                <span className="text-2xl font-bold text-indigo-500">Bilog</span>
              </Link>

              {/* ナビゲーション（デスクトップのみ） */}
              <nav className="hidden md:flex space-x-8 ml-8">
                <Link
                  to="/home"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  ホーム
                </Link>
                <Link
                  to="/log-timeline"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  記録一覧
                </Link>
                <Link
                  to="/manage-budget"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  予算管理
                </Link>
              </nav>
            </div>

            {/* 右側のアクション */}
            <div className="flex items-center space-x-4">
              <p className="hidden md:flex text-sm text-gray-500">{session?.user.email}</p>
              <Button className="text-xs" onClick={onLogout}>ログアウト</Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <Toaster position="top-center" richColors />
    </div>
  );
};
