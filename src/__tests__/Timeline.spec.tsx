import { TimelinePage } from "@/features/timeline/TimelinePage";
import { render } from "@/test-utils/render";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

vi.mock("@/lib/supabase/client", () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({
                data: { session: { user: { id: "test-user-id" } } },
            }),
        },
    },
}));

vi.mock("@/api/logs", () => ({
    fetchLogs: vi.fn().mockResolvedValue([]),
}));

describe("Timeline", () => {
    beforeEach(() => {
        render(
            <TimelinePage />
        );
    });

    test("記録がない場合にメッセージが表示されること", async () => {
        const message = await screen.findByText("まだ記録がありません");
        expect(message).toBeInTheDocument();
    });
})
