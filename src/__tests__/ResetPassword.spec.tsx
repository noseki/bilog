import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { render } from "@/test-utils/render";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";

const { mockResetPassword } = vi.hoisted(() => ({
  mockResetPassword: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: mockResetPassword,
    },
  },
}));

describe("ResetPasswordPage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    mockResetPassword.mockReset();
    mockResetPassword.mockResolvedValue({ error: null });
  });

  test("タイトルが「パスワードをお忘れですか？」であること", () => {
    render(<ResetPasswordPage />);
    expect(screen.getByText("パスワードをお忘れですか？")).toBeInTheDocument();
  });

  test("未入力で送信するとバリデーションエラーが表示されること", async () => {
    render(<ResetPasswordPage />);

    await user.click(screen.getByRole("button", { name: "パスワードを再設定する" }));

    expect(await screen.findByText("有効なメールアドレスを入力してください")).toBeInTheDocument();
  });

  test("送信成功後に完了画面に切り替わること", async () => {
    render(<ResetPasswordPage />);

    await user.type(screen.getByLabelText(/メールアドレス/), "test@example.com");
    await user.click(screen.getByRole("button", { name: "パスワードを再設定する" }));

    expect(await screen.findByText("メールを送信しました")).toBeInTheDocument();
  });

  test("送信失敗時にエラーメッセージが表示されること", async () => {
    mockResetPassword.mockResolvedValue({ error: new Error("Rate limit exceeded") });
    render(<ResetPasswordPage />);

    await user.type(screen.getByLabelText(/メールアドレス/), "test@example.com");
    await user.click(screen.getByRole("button", { name: "パスワードを再設定する" }));

    expect(await screen.findByText("メールの送信に失敗しました。再度お試しください。")).toBeInTheDocument();
  });
});
