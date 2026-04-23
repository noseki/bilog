import { ManageBudgetPage } from "@/features/budget/pages/ManageBudgetPage";
import { render } from "@/test-utils/render";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
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
    },
}));

const { mockFetchBudgets, mockDeleteBudget, mockFetchLogsByYearMonth } = vi.hoisted(() => {
    return {
        mockFetchBudgets: vi.fn(),
        mockDeleteBudget: vi.fn(),
        mockFetchLogsByYearMonth:  vi.fn(),
    };
});

vi.mock("@/features/budget/api/budgets", () => ({
    fetchBudgets: mockFetchBudgets,
    deleteBudget: mockDeleteBudget,
}));

vi.mock("@/features/log/api/logs", () => ({
    fetchLogsByYearMonth: mockFetchLogsByYearMonth,
}));

const baseMockBudget = {
    amount: 10000,
    id: "test-id-1",
    user_id: "test-user-id",
    year_month: "2026-04",
};

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

describe("ManageBudget", () => {
    const user = userEvent.setup();

    beforeEach(() => {
        mockNavigate.mockReset();
        mockFetchBudgets.mockReset();
        mockFetchBudgets.mockResolvedValue([]); // 空配列に戻す
        mockDeleteBudget.mockReset();
        mockDeleteBudget.mockResolvedValue(undefined);
        mockFetchLogsByYearMonth.mockReset();
        mockFetchLogsByYearMonth.mockResolvedValue([])
    });

    test("年月でグルーピングして表示されていること", async () => {
        mockFetchBudgets.mockResolvedValue([
            { ...baseMockBudget, id: "test-id-1", year_month: "2026-04" },
            { ...baseMockBudget, id: "test-id-2", year_month: "2026-03" },
        ]);
        render(<ManageBudgetPage />);

        expect(await screen.findByText("2026-04")).toBeInTheDocument();
        expect(screen.getByText("2026-03")).toBeInTheDocument();
    });

    test("予算額/使用額/残りが表示されていること", async () => {
        mockFetchBudgets.mockResolvedValue([{ ...baseMockBudget }]);
        mockFetchLogsByYearMonth.mockResolvedValue([
            {...baseMockLog}
        ]);
        render(<ManageBudgetPage />); //データをセットしてからレンダリング

        expect(await screen.findByText("¥10,000")).toBeInTheDocument();
        expect(screen.getByText("¥1,000")).toBeInTheDocument();
        expect(screen.getByText("¥9,000")).toBeInTheDocument();
    });

    test("記録がない場合にメッセージが表示されること", async () => {
        render(<ManageBudgetPage />);
        const message = await screen.findByText("予算が登録されていません");
        expect(message).toBeInTheDocument();
    });

    test("削除できること", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(true);
        mockFetchBudgets.mockResolvedValue([{ ...baseMockBudget }]);
        render(<ManageBudgetPage />);

        // オプションメニューを開く
        await user.click(await screen.findByRole("button", { name: "オプション" }));

        // DropdownMenuContent はポータルにレンダリングされるため findByRole で待つ
        await user.click(await screen.findByRole("menuitem", { name: /削除する/ }));

        await waitFor(() => {
            expect(mockDeleteBudget).toHaveBeenCalledWith(
                "test-id-1",
                expect.anything(),
            );
            expect(mockNavigate).toHaveBeenCalledWith("/manage-budget");
        });
    });

    test("キャンセルした場合は削除されないこと", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(false);
        mockFetchBudgets.mockResolvedValue([{ ...baseMockBudget }]);
        render(<ManageBudgetPage />);

        await user.click(await screen.findByRole("button", { name: "オプション" }));
        await user.click(await screen.findByRole("menuitem", { name: /削除する/ }));

        expect(mockDeleteBudget).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
