import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render as rtlRender } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"

export function render(ui: React.ReactNode) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false, // テストではリトライ不要
            },
        },
    });

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
