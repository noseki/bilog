import { render } from "@/test-utils/render";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { LogDetailPage } from "@/features/log/pages/LogDetailPage";
import { formatFullDate } from "@/features/log/utils/log";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "test-id-1" }),
  };
});

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
      }),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
      }),
    },
  },
}));

const baseMockLog = {
  after_photo_url: "https://picsum.photos/200/300",
  before_photo_url: "https://picsum.photos/200/300",
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

const { mockFetchLog, mockDeleteLog } = vi.hoisted(() => {
  return {
    mockFetchLog: vi.fn(),
    mockDeleteLog: vi.fn(),
  };
});

vi.mock("@/features/log/api/logs", () => ({
  fetchLog: mockFetchLog,
  deleteLog: mockDeleteLog,
}));

const user = userEvent.setup();

describe("LogDetail", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockFetchLog.mockReset();
    mockFetchLog.mockResolvedValue({});
    mockDeleteLog.mockReset();
    mockDeleteLog.mockResolvedValue(undefined);
  });

  test("記録の詳細（全項目）が表示されること", async () => {
    mockFetchLog.mockResolvedValue({ ...baseMockLog });
    render(<LogDetailPage />);

    expect(await screen.findByText("テストタイトル")).toBeInTheDocument();
    expect(screen.getByText("ネイル")).toBeInTheDocument();
    expect(screen.getByText(formatFullDate("2026-04-01"))).toBeInTheDocument();
    expect(screen.getByAltText("Before")).toBeInTheDocument();
    expect(screen.getByAltText("After")).toBeInTheDocument();
    expect(screen.getByText("¥1,000")).toBeInTheDocument();
    expect(screen.getByText("テストです")).toBeInTheDocument();
    expect(screen.getByText("test salon")).toBeInTheDocument();
    expect(screen.getByText("担当者：テスト花子さん")).toBeInTheDocument();
  });

  test("削除できること", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockFetchLog.mockResolvedValue({ ...baseMockLog });
    render(<LogDetailPage />);

    // オプションメニューを開く
    await user.click(await screen.findByRole("button", { name: "オプション" }));

    // DropdownMenuContent はポータルにレンダリングされるため findByRole で待つ
    await user.click(await screen.findByRole("menuitem", { name: /削除する/ }));

    await waitFor(() => {
      expect(mockDeleteLog).toHaveBeenCalledWith(
        "test-id-1",
        expect.anything(),
      );
      expect(mockNavigate).toHaveBeenCalledWith("/log-timeline");
    });
  });

  test("キャンセルした場合は削除されないこと", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    mockFetchLog.mockResolvedValue({ ...baseMockLog });
    render(<LogDetailPage />);

    await user.click(await screen.findByRole("button", { name: "オプション" }));
    await user.click(await screen.findByRole("menuitem", { name: /削除する/ }));

    expect(mockDeleteLog).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
