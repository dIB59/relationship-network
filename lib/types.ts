export interface Person {
  id: string
  name: string
  avatar?: string // avatar is now a URL or base64 image
  x: number
  y: number
}

// New: Network-wide events that can involve multiple people
export interface NetworkEvent {
  id: string
  type: "positive" | "negative" | "neutral"
  category: string
  description: string
  date: string
  image?: string // optional image for the event

  // Multi-person support
  participants: string[] // Array of person IDs involved in this event

  // Ripple effects - how this event affects various relationships
  impacts: {
    relationshipId: string  // Which relationship is affected
    impact: number          // -10 to +10
    reason?: string         // Optional explanation of why this relationship was affected
  }[]
}

// Legacy: Relationship-specific events (for backward compatibility)
export interface RelationshipEvent {
  id: string
  type: "positive" | "negative" | "neutral"
  category: string
  description: string
  impact: number // -10 to +10
  date: string
  image?: string // optional image for the event
  changesRelationshipTo?: string // if set, this event changes the relationship type
}

export interface Relationship {
  id: string
  person1Id: string
  person2Id: string
  type: string // e.g., "marriage", "friendship", "family", "colleague"
  healthScore: number // -100 to 100
  events: RelationshipEvent[] // Keep for backward compatibility

  // Directional perspectives (optional)
  p1ToP2Type?: string   // How Person 1 views Person 2
  p2ToP1Type?: string   // How Person 2 views Person 1
  p1ToP2Health?: number // Person 1's health/feeling score towards Person 2
  p2ToP1Health?: number // Person 2's health/feeling score towards Person 1
}

export type EventCategory = {
  name: string
  type: "positive" | "negative" | "neutral"
  defaultImpact: number
  changesRelationshipTo?: string // if set, this event type changes relationship
}

export const EVENT_CATEGORIES: EventCategory[] = [
  // Negative events
  { name: "Fight", type: "negative", defaultImpact: -15 },
  { name: "Argument", type: "negative", defaultImpact: -8 },
  { name: "Betrayal", type: "negative", defaultImpact: -25 },
  { name: "Neglect", type: "negative", defaultImpact: -5 },
  { name: "Lie", type: "negative", defaultImpact: -12 },
  // Positive events
  { name: "Gift", type: "positive", defaultImpact: 10 },
  { name: "Support", type: "positive", defaultImpact: 12 },
  { name: "Quality Time", type: "positive", defaultImpact: 8 },
  { name: "Apology", type: "positive", defaultImpact: 15 },
  { name: "Celebration", type: "positive", defaultImpact: 10 },
  { name: "Trip Together", type: "positive", defaultImpact: 18 },
  { name: "Achievement", type: "positive", defaultImpact: 7 },
  { name: "Marriage", type: "positive", defaultImpact: 25, changesRelationshipTo: "Marriage" },
  { name: "Engagement", type: "positive", defaultImpact: 20, changesRelationshipTo: "Engaged" },
  { name: "Divorce", type: "negative", defaultImpact: -30, changesRelationshipTo: "Ex" },
  { name: "Breakup", type: "negative", defaultImpact: -20, changesRelationshipTo: "Ex" },
  { name: "Reconciliation", type: "positive", defaultImpact: 15, changesRelationshipTo: "Partner" },
  { name: "Became Friends", type: "positive", defaultImpact: 10, changesRelationshipTo: "Friend" },
  { name: "Became Best Friends", type: "positive", defaultImpact: 15, changesRelationshipTo: "Best Friend" },
  { name: "Started Dating", type: "positive", defaultImpact: 15, changesRelationshipTo: "Partner" },
]

export const RELATIONSHIP_TYPES = [
  "Marriage",
  "Engaged",
  "Partner",
  "Family",
  "Friend",
  "Best Friend",
  "Colleague",
  "Acquaintance",
  "Ex",
  "Estranged",
]
