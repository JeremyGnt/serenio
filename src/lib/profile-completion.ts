import type { User } from "@supabase/supabase-js"

export interface ProfileCheck {
    label: string
    valid: boolean
    points: number
    key: string // unique key for identification
}

export function calculateProfileCompletion(user: User) {
    const metadata = user.user_metadata || {}

    // Avatar Logic: Check multiple keys
    const avatarUrl = metadata.picture || metadata.avatar_url || metadata.avatar || user.user_metadata?.picture

    const checks: ProfileCheck[] = [
        {
            key: "company_name",
            label: "Nom de l'entreprise",
            valid: !!metadata.company_name,
            points: 20
        },
        {
            key: "address",
            label: "Adresse définie",
            valid: !!metadata.street,
            points: 20
        },
        {
            key: "phone",
            label: "Téléphone renseigné",
            valid: !!metadata.phone,
            points: 20
        },
        {
            key: "experience",
            label: "Expérience renseignée",
            valid: !!metadata.experience,
            points: 20
        },
        {
            key: "avatar",
            label: "Photo de profil",
            valid: !!avatarUrl,
            points: 20
        },
    ]

    const completionScore = checks.reduce((acc, check) => acc + (check.valid ? check.points : 0), 0)
    const missingItems = checks.filter(c => !c.valid)
    const isComplete = completionScore === 100

    return {
        completionScore,
        missingItems,
        isComplete,
        checks
    }
}
