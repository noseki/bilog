import { fetchLogs } from "@/api/logs";
import { supabase } from "@/lib/supabase/client";
import type { Logs } from "@/types";
import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
    session: Session
};

export const HomePage = ({ session }: Props) => {
    const [logs, setLogs] = useState<Logs[]>([]);
    const navigate = useNavigate();
console.log(logs);
    useEffect(() => {
        fetchLogs(session.user.id).then(setLogs)
    }, [session]);

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
        <div>
            <p>ログイン中: {session.user.email}</p>
            <div>ホーム画面です</div>
            <button onClick={onLogout}>ログアウト</button>
        </div>
    );
};
