import { LogTimelinePage } from "@/features/log/LogTimelinePage";
import { render } from "@/test-utils/render";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// テスト用のダミーセッションを返す
vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: "test-user-id" } } },
      }),
    },
  },
}));

const { mockFetchLogs } = vi.hoisted(() => {
  return {
    mockFetchLogs: vi.fn(),
  };
});

vi.mock("@/api/logs", () => ({
  fetchLogs: mockFetchLogs,
}));

const baseMockLog = {
  after_photo_url: null,
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

describe("LogTimeline", () => {
  beforeEach(() => {
    mockFetchLogs.mockReset();
    mockFetchLogs.mockResolvedValue([]); // 空配列に戻す
  });

  test("年月でグルーピングして表示されていること", async () => {
    mockFetchLogs.mockResolvedValue([
      { ...baseMockLog, id: "test-id-1", done_at: "2026-04-01" },
      { ...baseMockLog, id: "test-id-2", done_at: "2026-03-01" },
    ]);
    render(<LogTimelinePage />);

    expect(await screen.findByText("2026-04")).toBeInTheDocument();
    expect(screen.getByText("2026-03")).toBeInTheDocument();
  });

  test("タイトル/カテゴリー/店舗名/担当者名/実施日/金額が表示されていること", async () => {
    mockFetchLogs.mockResolvedValue([{ ...baseMockLog }]);
    render(<LogTimelinePage />); //　データをセットしてからレンダリング

    expect(await screen.findByText("テストタイトル")).toBeInTheDocument();
    expect(screen.getByText("ネイル")).toBeInTheDocument();
    expect(screen.getByText("test salon")).toBeInTheDocument();
    expect(screen.getByText("担当者：テスト花子さん")).toBeInTheDocument();
    expect(screen.getByText("4/1")).toBeInTheDocument();
    expect(screen.getByText("¥1,000")).toBeInTheDocument();
  });

  test("記録がない場合にメッセージが表示されること", async () => {
    render(<LogTimelinePage />);
    const message = await screen.findByText("まだ記録がありません");
    expect(message).toBeInTheDocument();
  });
});
