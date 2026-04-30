import { render } from "@/test-utils/render";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { EditBudgetPage } from "@/features/budget/pages/EditBudgetPage";

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
    },
}));

const baseMockBudget = {
    amount: 10000,
    id: "test-id-1",
    user_id: "test-user-id",
    year_month: "2026-04",
};

const { mockFetchBudgetById, mockCreateBudget, mockUpdateBudget } = vi.hoisted(() => {
    return {
        mockFetchBudgetById: vi.fn(),
        mockCreateBudget: vi.fn(),
        mockUpdateBudget: vi.fn(),
    };
});

vi.mock("@/features/budget/api/budgets", () => ({
    fetchBudgetById: mockFetchBudgetById,
    createBudget: mockCreateBudget,
    updateBudget: mockUpdateBudget,
}));

describe("EditBudget", () => {
    const user = userEvent.setup();

    beforeEach(() => {
        mockNavigate.mockReset();
        mockFetchBudgetById.mockReset();
        mockFetchBudgetById.mockResolvedValue({});
        mockUpdateBudget.mockReset();
        mockUpdateBudget.mockResolvedValue(baseMockBudget);
    });

    test("タイトルが「予算編集」であること", async () => {
        render(<EditBudgetPage />);

        expect(await screen.findByText("予算編集")).toBeInTheDocument();
    });

    test("対象年月に既に記録があり、編集できないこと", async () => {
        mockFetchBudgetById.mockResolvedValue({ ...baseMockBudget });
        render(<EditBudgetPage />);

        expect(await screen.findByDisplayValue("2026-04")).toBeInTheDocument();
        expect(screen.getByLabelText(/対象年月/)).toBeDisabled();
    });

    test("予算額を編集して登録すると更新されること", async () => {
        mockFetchBudgetById.mockResolvedValue({ ...baseMockBudget });
        render(<EditBudgetPage />);

        const amountInput = await screen.findByLabelText(/予算額/);
        await user.clear(amountInput);
        await user.type(amountInput, "20000");
        await user.click(screen.getByRole("button", { name: "予算を更新する" }));

        await waitFor(() => {
            expect(mockUpdateBudget).toHaveBeenCalledWith(
                {
                    amount: 20000,
                    id: "test-id-1",
                },
                expect.anything(), // TanStack QueryがmutationFnに渡すコンテキスト引数
            );
            expect(mockNavigate).toHaveBeenCalledWith("/manage-budget");
        });
    });

    test("保存に失敗した場合はエラー表示されること", async () => {
        mockFetchBudgetById.mockResolvedValue({ ...baseMockBudget });
        mockUpdateBudget.mockRejectedValue(new Error(""));
        render(<EditBudgetPage />);

        await user.click(await screen.findByRole("button", { name: "予算を更新する" }));

        expect(await screen.findByText("保存に失敗しました。入力内容を確認してください。")).toBeInTheDocument();
    });
});
