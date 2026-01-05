import type { DiagnosticStep, SituationType } from "@/types/intervention"

// ============================================
// SITUATIONS (types de problème)
// ============================================

export interface SituationOption {
  code: SituationType
  label: string
  description: string
  icon: string // Nom de l'icône Lucide
  urgencyLevel: 1 | 2 | 3
}

export const SITUATIONS: SituationOption[] = [
  {
    code: "door_locked",
    label: "Porte claquée",
    description: "J'ai claqué ma porte et je suis enfermé dehors",
    icon: "DoorClosed",
    urgencyLevel: 2,
  },
  {
    code: "broken_key",
    label: "Clé cassée",
    description: "Ma clé s'est cassée dans la serrure",
    icon: "KeyRound",
    urgencyLevel: 2,
  },
  {
    code: "blocked_lock",
    label: "Serrure bloquée",
    description: "Ma serrure ne fonctionne plus, je ne peux pas entrer/sortir",
    icon: "Lock",
    urgencyLevel: 2,
  },
  {
    code: "break_in",
    label: "Effraction / Cambriolage",
    description: "Ma porte a été forcée, je dois sécuriser mon logement",
    icon: "ShieldAlert",
    urgencyLevel: 3,
  },
  {
    code: "lost_keys",
    label: "Perte de clés",
    description: "J'ai perdu mes clés et je ne peux plus entrer",
    icon: "KeySquare",
    urgencyLevel: 2,
  },
]

// ============================================
// TYPES DE PORTE
// ============================================

export const DOOR_TYPES = [
  { value: "standard", label: "Porte standard" },
  { value: "blindee", label: "Porte blindée" },
  { value: "cave", label: "Porte de cave" },
  { value: "garage", label: "Porte de garage" },
  { value: "other", label: "Autre" },
]

// ============================================
// TYPES DE SERRURE
// ============================================

export const LOCK_TYPES = [
  { value: "standard", label: "Serrure standard (1 point)" },
  { value: "multipoint", label: "Serrure multipoints (3 ou 5 points)" },
  { value: "electronique", label: "Serrure électronique / connectée" },
  { value: "other", label: "Je ne sais pas" },
]

// ============================================
// QUESTIONS DIAGNOSTIC PAR SITUATION
// ============================================

export const DIAGNOSTIC_QUESTIONS: Record<SituationType, DiagnosticStep[]> = {
  door_locked: [
    {
      id: "context",
      title: "Contexte",
      questions: [
        {
          id: "location_type",
          question: "Quel type de logement ?",
          type: "single",
          options: [
            { value: "appartement", label: "Appartement" },
            { value: "maison", label: "Maison" },
            { value: "bureau", label: "Bureau / Local" },
          ],
          required: true,
        },
        {
          id: "keys_inside",
          question: "Les clés sont-elles à l'intérieur ?",
          type: "boolean",
          required: true,
        },
        {
          id: "window_open",
          question: "Y a-t-il une fenêtre ou autre accès ouvert ?",
          type: "boolean",
          required: false,
        },
      ],
    },
    {
      id: "door_info",
      title: "Informations sur la porte",
      questions: [
        {
          id: "door_type",
          question: "Type de porte",
          type: "single",
          options: DOOR_TYPES.map((d) => ({ value: d.value, label: d.label })),
          required: true,
        },
        {
          id: "lock_type",
          question: "Type de serrure",
          type: "single",
          options: LOCK_TYPES.map((l) => ({ value: l.value, label: l.label })),
          required: true,
        },
      ],
    },
  ],

  broken_key: [
    {
      id: "context",
      title: "Contexte",
      questions: [
        {
          id: "key_piece_visible",
          question: "Le morceau de clé est-il visible dans la serrure ?",
          type: "boolean",
          required: true,
        },
        {
          id: "can_enter",
          question: "Pouvez-vous entrer chez vous par un autre accès ?",
          type: "boolean",
          required: true,
        },
      ],
    },
    {
      id: "door_info",
      title: "Informations sur la porte",
      questions: [
        {
          id: "door_type",
          question: "Type de porte",
          type: "single",
          options: DOOR_TYPES.map((d) => ({ value: d.value, label: d.label })),
          required: true,
        },
        {
          id: "lock_type",
          question: "Type de serrure",
          type: "single",
          options: LOCK_TYPES.map((l) => ({ value: l.value, label: l.label })),
          required: true,
        },
      ],
    },
  ],

  blocked_lock: [
    {
      id: "context",
      title: "Contexte",
      questions: [
        {
          id: "lock_turns",
          question: "La clé tourne-t-elle dans la serrure ?",
          type: "single",
          options: [
            { value: "yes", label: "Oui, mais la porte ne s'ouvre pas" },
            { value: "partially", label: "Partiellement, elle bloque" },
            { value: "no", label: "Non, impossible de tourner" },
          ],
          required: true,
        },
        {
          id: "recent_issue",
          question: "Le problème est-il apparu soudainement ?",
          type: "boolean",
          required: false,
        },
      ],
    },
    {
      id: "door_info",
      title: "Informations sur la porte",
      questions: [
        {
          id: "door_type",
          question: "Type de porte",
          type: "single",
          options: DOOR_TYPES.map((d) => ({ value: d.value, label: d.label })),
          required: true,
        },
        {
          id: "lock_type",
          question: "Type de serrure",
          type: "single",
          options: LOCK_TYPES.map((l) => ({ value: l.value, label: l.label })),
          required: true,
        },
      ],
    },
  ],

  break_in: [
    {
      id: "security",
      title: "Sécurité",
      questions: [
        {
          id: "police_called",
          question: "Avez-vous appelé la police ?",
          type: "boolean",
          required: true,
        },
        {
          id: "safe_location",
          question: "Êtes-vous en sécurité ?",
          type: "boolean",
          required: true,
        },
      ],
    },
    {
      id: "damage",
      title: "État des dégâts",
      questions: [
        {
          id: "damage_type",
          question: "Quels sont les dégâts ?",
          type: "multiple",
          options: [
            { value: "door_broken", label: "Porte forcée / cassée" },
            { value: "lock_broken", label: "Serrure endommagée" },
            { value: "frame_damaged", label: "Cadre de porte endommagé" },
            { value: "window_broken", label: "Fenêtre cassée" },
          ],
          required: true,
        },
        {
          id: "door_closable",
          question: "La porte peut-elle être fermée temporairement ?",
          type: "boolean",
          required: true,
        },
      ],
    },
  ],

  lost_keys: [
    {
      id: "context",
      title: "Contexte",
      questions: [
        {
          id: "spare_key",
          question: "Avez-vous un double des clés quelque part ?",
          type: "boolean",
          required: true,
        },
        {
          id: "need_lock_change",
          question: "Souhaitez-vous faire changer la serrure par sécurité ?",
          type: "boolean",
          required: true,
        },
      ],
    },
    {
      id: "door_info",
      title: "Informations sur la porte",
      questions: [
        {
          id: "door_type",
          question: "Type de porte",
          type: "single",
          options: DOOR_TYPES.map((d) => ({ value: d.value, label: d.label })),
          required: true,
        },
        {
          id: "lock_type",
          question: "Type de serrure",
          type: "single",
          options: LOCK_TYPES.map((l) => ({ value: l.value, label: l.label })),
          required: true,
        },
      ],
    },
  ],

  lock_change: [],
  cylinder_change: [],
  reinforced_door: [],

  other: [
    {
      id: "description",
      title: "Décrivez votre situation",
      questions: [
        {
          id: "situation_description",
          question: "Décrivez votre problème en quelques mots",
          type: "text",
          required: true,
        },
      ],
    },
  ],
}

// ============================================
// ÉTAPES DU PARCOURS
// ============================================

export const URGENCE_STEPS = [
  { id: "situation", label: "Situation", description: "Quel est votre problème ?" },
  { id: "diagnostic", label: "Diagnostic", description: "Quelques questions" },
  { id: "photos", label: "Photos", description: "Optionnel mais utile" },
  { id: "localisation", label: "Localisation", description: "Où êtes-vous ?" },
  { id: "contact", label: "Contact", description: "Comment vous joindre" },
  { id: "recap", label: "Récapitulatif", description: "Vérification" },
]

// ============================================
// LABELS DE STATUT
// ============================================

export const STATUS_LABELS: Record<string, { label: string; color: string; description: string }> = {
  draft: { label: "Brouillon", color: "gray", description: "Demande en cours de création" },
  pending: { label: "En attente", color: "yellow", description: "Recherche d'un serrurier..." },
  searching: { label: "Recherche", color: "yellow", description: "Recherche d'un serrurier disponible" },
  assigned: { label: "Assigné", color: "blue", description: "Un serrurier a été trouvé" },
  accepted: { label: "Accepté", color: "blue", description: "Le serrurier a accepté" },
  en_route: { label: "En route", color: "indigo", description: "Le serrurier est en chemin" },
  arrived: { label: "Arrivé", color: "indigo", description: "Le serrurier est sur place" },
  diagnosing: { label: "Diagnostic", color: "purple", description: "Diagnostic en cours" },
  quote_sent: { label: "Devis envoyé", color: "orange", description: "En attente de votre validation" },
  quote_accepted: { label: "Devis accepté", color: "green", description: "Intervention confirmée" },
  quote_refused: { label: "Devis refusé", color: "red", description: "Vous avez refusé le devis" },
  in_progress: { label: "En cours", color: "green", description: "Intervention en cours" },
  completed: { label: "Terminé", color: "green", description: "Intervention terminée" },
  cancelled: { label: "Annulé", color: "gray", description: "Demande annulée" },
  disputed: { label: "Litige", color: "red", description: "Litige en cours de traitement" },
}

