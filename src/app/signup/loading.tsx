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

            <div className="flex-1 flex flex-col items-center justify-center py-10">
                <div className="w-full max-w-sm space-y-8">
                    {/* Logo / Titre */}
                    <div className="flex flex-col items-center gap-2">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-36 mt-2" />
                        {/* Artisan link placeholder */}
                        <Skeleton className="h-4 w-48 mt-3" />
                    </div>

                    {/* Formulaire */}
                    <div className="space-y-5">
                        {/* Nom & Prénom */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>

                        {/* Adresse */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>

                        {/* Code postal & Ville */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                            <Skeleton className="h-3 w-48" />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>

                        <Skeleton className="h-12 w-full rounded-md mt-6" />

                        <div className="flex justify-center flex-col items-center gap-2 mt-4">
                            <Skeleton className="h-3 w-64" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
