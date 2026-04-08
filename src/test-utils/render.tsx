import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render as rtlRender } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1, // 失敗したクエリは1回だけ再試行
        },
    },
});

export function render(ui: React.ReactNode) {
    return rtlRender(<>{ui}</>, {
        wrapper: (props: React.PropsWithChildren) => (
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    {props.children}
                </BrowserRouter>
            </QueryClientProvider>
        ),
    })
}
