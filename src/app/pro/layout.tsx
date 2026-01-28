import { LoadingProvider } from "@/components/providers/loading-provider"

export default function ProLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <LoadingProvider>
            {children}
        </LoadingProvider>
    )
}
