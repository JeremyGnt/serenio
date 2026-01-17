/**
 * Calculate the distance between two geographic points using the Haversine formula.
 * Returns the distance in kilometers.
 */
export function calculateDistance(
    lat1: number | null | undefined,
    lon1: number | null | undefined,
    lat2: number | null | undefined,
    lon2: number | null | undefined
): number | null {
    // If any coordinate is missing, return null
    if (lat1 === null || lat1 === undefined || lon1 === null || lon1 === undefined || lat2 === null || lat2 === undefined || lon2 === null || lon2 === undefined) {
        return null
    }

    const R = 6371 // Earth's radius in kilometers

    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    const distance = R * c

    // Round to 1 decimal place
    return Math.round(distance * 10) / 10
}

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
}

/**
 * Format distance for display
 * @param distance Distance in km or null
 * @returns Formatted string like "2.1 km" or null if unavailable
 */
export function formatDistance(distance: number | null): string | null {
    if (distance === null || distance === undefined) {
        return null
    }

    if (distance < 1) {
        // Show in meters for very short distances
        return `${Math.round(distance * 1000)} m`
    }

    return `${distance} km`
}
