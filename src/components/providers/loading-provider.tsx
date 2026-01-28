"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { Loader2 } from "lucide-react"

interface LoadingContextType {
    isLoading: boolean
    setIsLoading: (loading: boolean) => void
    showLoader: () => void
    hideLoader: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false)

    const showLoader = () => setIsLoading(true)
    const hideLoader = () => setIsLoading(false)

    return (
        <LoadingContext.Provider value={{ isLoading, setIsLoading, showLoader, hideLoader }}>
            {children}
            {isLoading && (
                <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-4 max-w-xs w-full mx-4">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900">Finalisation en cours...</h3>
                            <p className="text-sm text-gray-500 mt-1">Veuillez patienter quelques instants</p>
                        </div>
                    </div>
                </div>
            )}
        </LoadingContext.Provider>
    )
}

export function useLoading() {
    const context = useContext(LoadingContext)
    if (context === undefined) {
        throw new Error("useLoading must be used within a LoadingProvider")
    }
    return context
}
