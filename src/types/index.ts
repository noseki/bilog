export type Logs = {
    id: string;
    user_id: string;
    category: 'hair'| 'nail' | 'lash' | 'esthetic' | 'medical';
    title: string;
    detail: string | null;
    cost: number;
    done_at: string;
    next_interval_days: string | null;
    before_photo_url: string | null;
    after_photo_url: string | null;
    salon_name: string | null;
    staff_name: string | null;
    created_at: string;
};
