import type { Session } from "@supabase/supabase-js";

type Props = {
    session: Session;
};

export const HomePage = ({ session }: Props) => {
    return (
        <div>
            <p>ログイン中: {session.user.email}</p>
            <div>ホーム画面です</div>
        </div>
    );
};
