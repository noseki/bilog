import { render } from "@/test-utils/render";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { EditLogPage } from "@/features/log/pages/EditLogPage";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "test-id-1" }),
  };
});

// テスト用のダミーユーザーを返す
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

const { mockCreateLog, mockUpdateLog, mockFetchLog } = vi.hoisted(() => {
  return {
    mockCreateLog: vi.fn(),
    mockUpdateLog: vi.fn(),
    mockFetchLog: vi.fn(),
  };
});

vi.mock("@/api/logs", () => ({
  createLog: mockCreateLog,
  updateLog: mockUpdateLog,
  fetchLog: mockFetchLog,
}));

const user = userEvent.setup();

describe("EditLog", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockFetchLog.mockReset();
    mockFetchLog.mockResolvedValue({});
    mockUpdateLog.mockReset();
    mockUpdateLog.mockResolvedValue(baseMockLog);
  });

  test("タイトルが「記録編集」であること", async () => {
    render(<EditLogPage />);

    expect(await screen.findByText("記録編集")).toBeInTheDocument();
  });

  test("編集して登録すると更新されること", async () => {
    mockFetchLog.mockResolvedValue({ ...baseMockLog });
    render(<EditLogPage />);

    const titleInput = await screen.findByLabelText(/タイトル/);
    await user.clear(titleInput);
    await user.type(titleInput, "テストタイトル編集");
    await user.click(screen.getByRole("button", { name: "記録を更新する" }));

    await waitFor(() => {
      expect(mockUpdateLog).toHaveBeenCalledWith(
        expect.objectContaining({
          formData: expect.objectContaining({ title: "テストタイトル編集" }),
          logId: "test-id-1",
        }),
        expect.anything(), // TanStack QueryがmutationFnに渡すコンテキスト引数
      );
      expect(mockNavigate).toHaveBeenCalledWith("/log-timeline");
    });
  });
});
