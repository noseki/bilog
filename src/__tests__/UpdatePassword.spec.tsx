import { UpdatePasswordPage } from "@/features/auth/pages/UpdatePasswordPage";
import { render } from "@/test-utils/render";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const { mockUpdateUser } = vi.hoisted(() => ({
  mockUpdateUser: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      updateUser: mockUpdateUser,
    },
  },
}));

describe("UpdatePasswordPage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    mockUpdateUser.mockReset();
    mockUpdateUser.mockResolvedValue({ error: null });
    mockNavigate.mockReset();
  });

  test("タイトルが「パスワード再設定」であること", () => {
    render(<UpdatePasswordPage />);
    expect(screen.getByText("パスワード再設定")).toBeInTheDocument();
  });

  test("未入力で送信するとバリデーションエラーが表示されること", async () => {
    render(<UpdatePasswordPage />);

    await user.click(screen.getByRole("button", { name: "パスワードを更新する" }));

    expect(await screen.findByText("パスワードは8文字以上で入力してください")).toBeInTheDocument();
  });

  test("パスワードが一致しない場合にエラーが表示されること", async () => {
    render(<UpdatePasswordPage />);

    await user.type(screen.getByLabelText(/新規パスワード$/), "pass1234");
    await user.type(screen.getByLabelText(/新規パスワード（確認）/), "pass9999");
    await user.click(screen.getByRole("button", { name: "パスワードを更新する" }));

    expect(await screen.findByText("パスワードが一致しません")).toBeInTheDocument();
  });

  test("更新成功後に/loginへ遷移すること", async () => {
    render(<UpdatePasswordPage />);

    await user.type(screen.getByLabelText(/新規パスワード$/), "pass1234");
    await user.type(screen.getByLabelText(/新規パスワード（確認）/), "pass1234");
    await user.click(screen.getByRole("button", { name: "パスワードを更新する" }));

    expect(mockNavigate).toHaveBeenCalledWith("/login", { state: { referrer: "login" } });
  });

  test("同一パスワードエラー時に専用メッセージが表示されること", async () => {
    mockUpdateUser.mockResolvedValue({
      error: new Error("New password should be different from the old password."),
    });
    render(<UpdatePasswordPage />);

    await user.type(screen.getByLabelText(/新規パスワード$/), "pass1234");
    await user.type(screen.getByLabelText(/新規パスワード（確認）/), "pass1234");
    await user.click(screen.getByRole("button", { name: "パスワードを更新する" }));

    expect(await screen.findByText("以前と同じパスワードは使用できません。別のパスワードを設定してください。")).toBeInTheDocument();
  });

  test("その他エラー時に汎用メッセージが表示されること", async () => {
    mockUpdateUser.mockResolvedValue({ error: new Error("Unknown error") });
    render(<UpdatePasswordPage />);

    await user.type(screen.getByLabelText(/新規パスワード$/), "pass1234");
    await user.type(screen.getByLabelText(/新規パスワード（確認）/), "pass1234");
    await user.click(screen.getByRole("button", { name: "パスワードを更新する" }));

    expect(await screen.findByText("パスワードの更新に失敗しました。再度お試しください。")).toBeInTheDocument();
  });
});
