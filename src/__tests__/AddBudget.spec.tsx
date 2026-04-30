import { render } from "@/test-utils/render";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { AddBudgetPage } from "@/features/budget/pages/AddBudgetPage";

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

const { mockCreateBudget, mockUpdateBudget } = vi.hoisted(() => {
    return {
        mockCreateBudget: vi.fn(),
        mockUpdateBudget: vi.fn(),
    };
});

vi.mock("@/features/budget/api/budgets", () => ({
    createBudget: mockCreateBudget,
    updateBudget: mockUpdateBudget,
}));

describe("AddBudget", () => {
    const user = userEvent.setup();

    beforeEach(() => {
        mockCreateBudget.mockReset();
        mockCreateBudget.mockResolvedValue([]); // 空配列に戻す
    });

    test("タイトルが「予算設定」であること", () => {
        render(<AddBudgetPage />);

        expect(screen.getByText("予算設定")).toBeInTheDocument();
    });

    test("全項目入力して登録ボタンを押すと/manage-budgetに遷移する", async () => {
        render(<AddBudgetPage />);

        await user.type(screen.getByLabelText(/対象年月/), "2026-04");
        await user.type(screen.getByLabelText(/予算額/), "10000");

        await user.click(screen.getByRole("button", { name: "予算を設定する" }));

        expect(mockNavigate).toHaveBeenCalledWith("/manage-budget");
    });

    test("必須項目(対象年月/予算額)を入力しないとエラーがでる", async () => {
        render(<AddBudgetPage />);

        await user.click(screen.getByRole("button", { name: "予算を設定する" }));

        expect(await screen.findByText("年月を選択してください")).toBeInTheDocument();
        expect(await screen.findByText("予算額を入力してください")).toBeInTheDocument();
    });

    test("同じ年月の予算が既に存在する場合はエラーが表示されること", async () => {
        mockCreateBudget.mockRejectedValue(new Error("DUPLICATE_YEAR_MONTH"));
        render(<AddBudgetPage />);

        await user.type(screen.getByLabelText(/対象年月/), "2026-04");
        await user.type(screen.getByLabelText(/予算額/), "10000");
        await user.click(screen.getByRole("button", { name: "予算を設定する" }));

        expect(await screen.findByText("この年月の予算は既に設定されています")).toBeInTheDocument();
    });

    test("保存に失敗した場合はエラー表示されること", async () => {
        mockCreateBudget.mockRejectedValue(new Error(""));
        render(<AddBudgetPage />);

        await user.type(screen.getByLabelText(/対象年月/), "2026-04");
        await user.type(screen.getByLabelText(/予算額/), "10000");
        await user.click(screen.getByRole("button", { name: "予算を設定する" }));

        expect(await screen.findByText("保存に失敗しました。入力内容を確認してください。")).toBeInTheDocument();
    });
});
