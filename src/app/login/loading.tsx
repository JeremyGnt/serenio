import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col px-4 py-6 animate-in fade-in duration-500">
            {/* Retour à l'accueil skeleton */}
            <div className="w-fit p-2 -ml-2">
                <div className="inline-flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5 text-gray-200" />
                    <Skeleton className="h-4 w-32 hidden sm:block" />
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center -mt-8">
                <div className="w-full max-w-sm space-y-8">
                    {/* Logo / Titre */}
                    <div className="flex flex-col items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-4 w-56 max-w-full" />
                    </div>

                    {/* Formulaire */}
                    <div className="space-y-6 bg-white/50 p-1 sm:bg-transparent sm:p-0">
                        {/* Google Button */}
                        <Skeleton className="h-11 w-full rounded-xl" />

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-100" />
                            </div>
                            <div className="relative flex justify-center">
                                <Skeleton className="h-4 w-8 rounded-full" />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-11 w-full rounded-xl" />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <Skeleton className="h-11 w-full rounded-xl" />
                        </div>

                        <Skeleton className="h-11 w-full rounded-xl mt-8" />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-center gap-2 pt-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            </div>
        </div>
    )
}
