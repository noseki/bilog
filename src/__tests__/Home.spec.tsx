import { HomePage } from "@/features/home/HomePage";
import { render } from "@/test-utils/render";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { formatFullDate } from "@/utils/log";

// テスト用のダミーユーザーを返す
vi.mock("@/lib/supabase/client", () => ({
    supabase: {
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: { user: { id: "test-user-id" } },
            }),
        },
    },
}));

const { mockFetchLogsWithAfterPhotos } = vi.hoisted(() => {
    return {
        mockFetchLogsWithAfterPhotos: vi.fn(),
    };
});

vi.mock("@/api/logs", () => ({
    fetchLogsWithAfterPhotos: mockFetchLogsWithAfterPhotos,
}));

const baseMockLog = {
    after_photo_url: "https://picsum.photos/200/300",
    before_photo_url: null,
    category: "nail" as const,
    cost: 1000,
    created_at: "2026-04-01 09:16:52.56655+00",
    detail: "テストです",
    done_at: "2026-04-01",
    id: "test-id-1",
    next_interval_days: null,
    salon_name: "test salon",
    staff_name: "テスト花子さん",
    title: "テストタイトル",
    user_id: "test-user-id",
};

const user = userEvent.setup();

describe("Home", () => {
    beforeEach(() => {
        mockFetchLogsWithAfterPhotos.mockReset();
        mockFetchLogsWithAfterPhotos.mockResolvedValue([]); // 空配列に戻す
    });

    test("美容履歴がカテゴリ別に表示されていること", async () => {
        mockFetchLogsWithAfterPhotos.mockResolvedValue([
            { ...baseMockLog, id: "test-id-1", category:"nail", done_at: "2026-04-01" },
            { ...baseMockLog, id: "test-id-2", category:"hair", done_at: "2026-03-01" },
        ]);
        render(<HomePage />);

        expect(await screen.findByText("ヘア")).toBeInTheDocument();
        expect(screen.getByText("ネイル")).toBeInTheDocument();
    });

    test("美容履歴が同一カテゴリ内でdone_atの昇順(done_atが同じ場合はcreated_atの昇順)で表示されていること", async () => {
        mockFetchLogsWithAfterPhotos.mockResolvedValue([
            { ...baseMockLog, id: "test-id-1", done_at: "2026-04-01", title: "テストタイトル3", created_at: "2026-04-01 09:16:52.56655+00" },
            { ...baseMockLog, id: "test-id-2", done_at: "2026-03-01", title: "テストタイトル2", created_at: "2026-03-02 09:16:52.56655+00" },
            { ...baseMockLog, id: "test-id-3", done_at: "2026-03-01", title: "テストタイトル1", created_at: "2026-03-01 09:16:52.56655+00" },
        ]);
        render(<HomePage />);

        const items = await screen.findAllByTestId('categoryLogs-item');
        const actualOrder = items.map(item => item.textContent);

        expect(actualOrder).toEqual([
            `${formatFullDate("2026-03-01")}テストタイトル1`,
            `${formatFullDate("2026-03-01")}テストタイトル2`,
            `${formatFullDate("2026-04-01")}テストタイトル3`,
        ]);
    });

    test("美容履歴でカテゴリー/after写真/日付/タイトルが表示されていること", async () => {
        mockFetchLogsWithAfterPhotos.mockResolvedValue([{ ...baseMockLog }]);
        render(<HomePage />);

        expect(await screen.findByText("ネイル")).toBeInTheDocument();
        expect(screen.getByAltText("テストタイトル")).toBeInTheDocument(); // alt属性の値はタイトル名
        expect(screen.getByText(formatFullDate("2026-04-01"))).toBeInTheDocument();
        expect(screen.getByText("テストタイトル")).toBeInTheDocument();
    });

    test("美容履歴で表示ビューを押すと該当する詳細画面に遷移すること", async () => {
        mockFetchLogsWithAfterPhotos.mockResolvedValue([{ ...baseMockLog }]);
        render(<HomePage />);

        const items = await screen.findAllByTestId('categoryLogs-item');
        await user.click(items[0]);

        expect(items[0]).toHaveAttribute('href', '/log-timeline/test-id-1');
    });

    test("美容履歴で写真がない場合にメッセージが表示されること", async () => {
        render(<HomePage />);
        const message = await screen.findByText("まだ写真がありません");
        expect(message).toBeInTheDocument();
    });
});
