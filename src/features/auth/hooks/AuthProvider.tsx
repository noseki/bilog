import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { AuthContext } from "./useAuth";
import { SpinnerCustom } from "@/components/ui/spinner";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // 全タブ共有のフラグを立ててパスワード再設定中であることを示す
        localStorage.setItem("bilog:recoveryMode", "true");
      }
      if (event === "USER_UPDATED") {
        localStorage.removeItem("bilog:recoveryMode");
      }
      setSession(session);
      if (event === "INITIAL_SESSION") {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <SpinnerCustom />;

  return (
    <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
  );
};
