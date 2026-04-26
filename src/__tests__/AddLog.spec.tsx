import { AddLogPage } from "@/features/log/pages/AddLogPage";
import { render } from "@/test-utils/render";
import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";

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
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
      }),
    },
  },
}));

const { mockCreateLog, mockUpdateLog } = vi.hoisted(() => {
  return {
    mockCreateLog: vi.fn(),
    mockUpdateLog: vi.fn(),
  };
});

vi.mock("@/features/log/api/logs", () => ({
  createLog: mockCreateLog,
  updateLog: mockUpdateLog,
}));

describe("AddLog", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    mockCreateLog.mockReset();
    mockCreateLog.mockResolvedValue([]); // 空配列に戻す
  });

  test("タイトルが「記録追加」であること", () => {
    render(<AddLogPage />);

    expect(screen.getByText("記録追加")).toBeInTheDocument();
  });

  test("全項目入力して登録ボタンを押すと/log-timelineに遷移する", async () => {
    render(<AddLogPage />);

    await user.click(screen.getByRole("combobox", { name: /カテゴリー/ }));
    await user.click(screen.getByRole("option", { name: "ヘア" }));

    await user.type(screen.getByLabelText(/タイトル/), "テストヘア");
    await user.type(screen.getByLabelText(/詳細メモ/), "テストです");
    await user.type(screen.getByLabelText(/金額/), "5000");

    // 実施日
    // ポップオーバーを開く
    await user.click(screen.getByRole("button", { name: /日付を選択/ }));

    // カレンダーが表示されるまで待つ
    const grid = await screen.findByRole("grid"); // カレンダーグリッド
    const dayButton = within(grid).getByRole("button", { name: /15/ });
    await user.click(dayButton);

    // 画像
    const file = new File(["dummy"], "test.jpg", { type: "image/jpeg" });
    await user.upload(screen.getByLabelText("実施前の写真"), file);
    await user.upload(screen.getByLabelText("実施後の写真"), file);

    await user.type(screen.getByLabelText(/店舗名/), "テストサロン");
    await user.type(screen.getByLabelText(/担当者名/), "テスト花子");

    await user.click(screen.getByRole("button", { name: "記録を追加する" }));

    expect(mockNavigate).toHaveBeenCalledWith("/log-timeline");
  });

  test("必須項目(カテゴリー/タイトル/実施日)を入力しないとエラーがでる", async () => {
    render(<AddLogPage />);

    await user.click(screen.getByRole("button", { name: "記録を追加する" }));

    // 金額はデフォルト値が0なのでエラーは出ない
    expect(await screen.findByText("カテゴリーを選択してください")).toBeInTheDocument();
    expect(await screen.findByText("タイトルを入力してください")).toBeInTheDocument();
    expect(await screen.findByText("実施日を入力してください")).toBeInTheDocument();
  });

  test("必須項目を入力しなくても登録ボタンを押すと登録できて/log-timelineに遷移する", async () => {
    render(<AddLogPage />);

    await user.click(screen.getByRole("combobox", { name: /カテゴリー/ }));
    await user.click(screen.getByRole("option", { name: "ヘア" }));

    await user.type(screen.getByLabelText(/タイトル/), "テストヘア");
    await user.type(screen.getByLabelText(/金額/), "5000");

    // 実施日
    // ポップオーバーを開く
    await user.click(screen.getByRole("button", { name: /日付を選択/ }));

    // カレンダーが表示されるまで待つ
    const grid = await screen.findByRole("grid"); // カレンダーグリッド
    const dayButton = within(grid).getByRole("button", { name: /15/ });
    await user.click(dayButton);

    await user.click(screen.getByRole("button", { name: "記録を追加する" }));

    expect(mockNavigate).toHaveBeenCalledWith("/log-timeline");
  });

  test("保存に失敗した場合はエラー表示されること", async () => {
      mockCreateLog.mockRejectedValue(new Error(""));
      render(<AddLogPage />);

      await user.click(screen.getByRole("combobox", { name: /カテゴリー/ }));
      await user.click(screen.getByRole("option", { name: "ヘア" }));

      await user.type(screen.getByLabelText(/タイトル/), "テストヘア");
      await user.type(screen.getByLabelText(/金額/), "5000");

      // 実施日
      // ポップオーバーを開く
      await user.click(screen.getByRole("button", { name: /日付を選択/ }));

      // カレンダーが表示されるまで待つ
      const grid = await screen.findByRole("grid"); // カレンダーグリッド
      const dayButton = within(grid).getByRole("button", { name: /15/ });
      await user.click(dayButton);

      await user.click(screen.getByRole("button", { name: "記録を追加する" }));

      expect(await screen.findByText("保存に失敗しました。入力内容を確認してください。")).toBeInTheDocument();
  });
});
