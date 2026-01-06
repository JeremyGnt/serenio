import type { 
  RdvServiceTypeDisplay,
  DayAvailability,
  RdvFormState 
} from "@/types/rdv"

// ============================================
// FONCTIONS UTILITAIRES CÔTÉ CLIENT
// ============================================
// Les fonctions de base de données sont dans actions.ts (server actions)

// Générer les jours disponibles pour les 14 prochains jours (hors dimanche)
export function generateAvailableDays(): DayAvailability[] {
  const days: DayAvailability[] = []
  const today = new Date()
  
  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
  const monthNames = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
  
  for (let i = 1; i <= 14; i++) { // Commence à demain
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    // Exclure dimanche (0)
    if (date.getDay() === 0) continue
    
    const dateStr = date.toISOString().split("T")[0]
    
    days.push({
      date: dateStr,
      dayName: dayNames[date.getDay()],
      dayNumber: date.getDate(),
      month: monthNames[date.getMonth()],
      slots: [],
      isToday: false,
      isPast: false,
    })
  }
  
  return days
}

// ============================================
// ESTIMATION DE PRIX
// ============================================

export interface PriceEstimate {
  min: number
  max: number
  includes: string[]
  variables: string[]
}

export function calculatePriceEstimate(
  serviceType: RdvServiceTypeDisplay,
  diagnostic: RdvFormState["diagnostic"]
): PriceEstimate {
  let baseMin = serviceType.priceFrom
  let baseMax = serviceType.priceTo || serviceType.priceFrom * 2
  
  // Ajustements selon le diagnostic
  const includes: string[] = [
    "Déplacement du professionnel",
    "Main d'œuvre",
    "Diagnostic sur place",
  ]
  
  const variables: string[] = []
  
  // Porte blindée = plus cher
  if (diagnostic.doorType === "blindee") {
    baseMin *= 1.3
    baseMax *= 1.5
    variables.push("Type de porte (blindée)")
    includes.push("Matériel compatible porte blindée")
  }
  
  // Serrure multipoints = plus cher
  if (diagnostic.lockType === "multipoint") {
    baseMin *= 1.2
    baseMax *= 1.3
    variables.push("Type de serrure (multipoints)")
  }
  
  // Serrure électronique = plus cher
  if (diagnostic.lockType === "electronique") {
    baseMin *= 1.4
    baseMax *= 1.6
    variables.push("Type de serrure (électronique)")
  }
  
  // Effraction = sécurisation supplémentaire
  if (diagnostic.hasBeenBrokenInto) {
    baseMax *= 1.3
    variables.push("Sécurisation post-effraction")
    includes.push("Conseils sécurité")
  }
  
  // Accès difficile
  if (diagnostic.accessDifficulty === "difficile") {
    baseMin *= 1.1
    baseMax *= 1.2
    variables.push("Accessibilité du lieu")
  }

  // Ancien = potentiellement plus complexe
  if (diagnostic.lockAge === "ancien") {
    variables.push("Âge de la serrure")
  }

  return {
    min: Math.round(baseMin),
    max: Math.round(baseMax),
    includes,
    variables: variables.length > 0 ? variables : ["Aucun facteur variable détecté"],
  }
}

// ============================================
// CRÉNEAUX HORAIRES PAR DÉFAUT
// ============================================

export interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  label: string
}

export function getDefaultTimeSlots(): TimeSlot[] {
  return [
    { id: "morning-1", startTime: "08:00", endTime: "10:00", label: "8h - 10h" },
    { id: "morning-2", startTime: "10:00", endTime: "12:00", label: "10h - 12h" },
    { id: "afternoon-1", startTime: "14:00", endTime: "16:00", label: "14h - 16h" },
    { id: "afternoon-2", startTime: "16:00", endTime: "18:00", label: "16h - 18h" },
    { id: "evening", startTime: "18:00", endTime: "20:00", label: "18h - 20h" },
  ]
}
