import { SignUpPage } from "@/features/auth/pages/SignUpPage";
import { render } from "@/test-utils/render";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";

const { mockSignUp } = vi.hoisted(() => ({
  mockSignUp: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      signUp: mockSignUp,
    },
  },
}));

describe("SignUpPage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    mockSignUp.mockReset();
    mockSignUp.mockResolvedValue({ error: null });
  });

  test("タイトルが「新規登録」であること", () => {
    render(<SignUpPage />);
    expect(screen.getByText("新規登録")).toBeInTheDocument();
  });

  test("未入力で送信するとバリデーションエラーが表示されること", async () => {
    render(<SignUpPage />);

    await user.click(screen.getByRole("button", { name: "登録する" }));

    expect(await screen.findByText("有効なメールアドレスを入力してください")).toBeInTheDocument();
    expect(await screen.findByText("パスワードは8文字以上で入力してください")).toBeInTheDocument();
  });

  test("パスワードが一致しない場合にエラーが表示されること", async () => {
    render(<SignUpPage />);

    await user.type(screen.getByLabelText(/メールアドレス/), "test@example.com");
    await user.type(screen.getByLabelText("パスワード"), "pass1234");
    await user.type(screen.getByLabelText(/パスワード（確認）/), "pass9999");
    await user.click(screen.getByRole("button", { name: "登録する" }));

    expect(await screen.findByText("パスワードが一致しません")).toBeInTheDocument();
  });

  test("登録成功後に確認メール送信済み画面に切り替わること", async () => {
    render(<SignUpPage />);

    await user.type(screen.getByLabelText(/メールアドレス/), "test@example.com");
    await user.type(screen.getByLabelText("パスワード"), "pass1234");
    await user.type(screen.getByLabelText(/パスワード（確認）/), "pass1234");
    await user.click(screen.getByRole("button", { name: "登録する" }));

    expect(await screen.findByText("確認メールを送信しました")).toBeInTheDocument();
  });

  test("登録失敗時にエラーメッセージが表示されること", async () => {
    mockSignUp.mockResolvedValue({ error: new Error("User already registered") });
    render(<SignUpPage />);

    await user.type(screen.getByLabelText(/メールアドレス/), "test@example.com");
    await user.type(screen.getByLabelText("パスワード"), "pass1234");
    await user.type(screen.getByLabelText(/パスワード（確認）/), "pass1234");
    await user.click(screen.getByRole("button", { name: "登録する" }));

    expect(await screen.findByText("登録に失敗しました。再度お試しください。")).toBeInTheDocument();
  });
});
