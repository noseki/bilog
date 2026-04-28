import { LoginPage } from "@/features/auth/pages/LoginPage";
import { render } from "@/test-utils/render";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";

const { mockSignIn } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignIn,
    },
  },
}));

describe("LoginPage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    mockSignIn.mockReset();
    mockSignIn.mockResolvedValue({ error: null });
  });

  test("タイトルが「ログイン」であること", () => {
    render(<LoginPage />);
    // CardTitle とボタンの両方に「ログイン」が表示される
    expect(screen.getAllByText("ログイン")).toHaveLength(2);
  });

  test("未入力で送信するとバリデーションエラーが表示されること", async () => {
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "ログイン" }));

    expect(await screen.findByText("有効なメールアドレスを入力してください")).toBeInTheDocument();
    expect(await screen.findByText("パスワードを入力してください")).toBeInTheDocument();
  });

  test("正しい情報でログインするとsignInWithPasswordが呼ばれること", async () => {
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/メールアドレス/), "test@example.com");
    await user.type(screen.getByLabelText(/パスワード/), "password123");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    expect(mockSignIn).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
    expect(screen.queryByText("メールアドレスまたはパスワードが正しくありません")).not.toBeInTheDocument();
  });

  test("ログイン失敗時にエラーメッセージが表示されること", async () => {
    mockSignIn.mockResolvedValue({ error: new Error("Invalid credentials") });
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/メールアドレス/), "test@example.com");
    await user.type(screen.getByLabelText(/パスワード/), "wrongpass");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    expect(await screen.findByText("メールアドレスまたはパスワードが正しくありません")).toBeInTheDocument();
  });
});
