import type { Person, Relationship, RelationshipEvent, NetworkEvent } from "./types"

let people: Person[] = []
let relationships: Relationship[] = []
let networkEvents: NetworkEvent[] = []

export function getPeople(): Person[] {
  return people
}

export function getRelationships(): Relationship[] {
  return relationships
}

export function getNetworkEvents(): NetworkEvent[] {
  return networkEvents
}

export function addPerson(person: Person): void {
  people = [...people, person]
}

export function updatePerson(id: string, updates: Partial<Person>): void {
  people = people.map((p) => (p.id === id ? { ...p, ...updates } : p))
}

export function updatePersonPosition(id: string, x: number, y: number): void {
  people = people.map((p) => (p.id === id ? { ...p, x, y } : p))
}

export function deletePerson(id: string): void {
  people = people.filter((p) => p.id !== id)
  relationships = relationships.filter((r) => r.person1Id !== id && r.person2Id !== id)
}

export function addRelationship(relationship: Relationship): void {
  relationships = [...relationships, relationship]
}

export function addEventToRelationship(relationshipId: string, event: RelationshipEvent): void {
  relationships = relationships.map((r) => {
    if (r.id === relationshipId) {
      const newHealthScore = Math.max(-100, Math.min(100, r.healthScore + event.impact))
      return {
        ...r,
        healthScore: newHealthScore,
        events: [...r.events, event],
        // If the event changes the relationship type, update it
        type: event.changesRelationshipTo || r.type,
      }
    }
    return r
  })
}

export function deleteRelationship(id: string): void {
  relationships = relationships.filter((r) => r.id !== id)
}

export function getRelationshipsForPerson(personId: string): Relationship[] {
  return relationships.filter((r) => r.person1Id === personId || r.person2Id === personId)
}

// Network event management
export function addNetworkEvent(event: NetworkEvent): void {
  networkEvents = [...networkEvents, event]

  // Apply impacts to affected relationships
  event.impacts.forEach(impact => {
    const relationship = relationships.find(r => r.id === impact.relationshipId)
    if (relationship) {
      const newHealthScore = Math.max(-100, Math.min(100, relationship.healthScore + impact.impact))
      relationships = relationships.map(r =>
        r.id === impact.relationshipId
          ? { ...r, healthScore: newHealthScore }
          : r
      )
    }
  })
}

export function deleteNetworkEvent(id: string): void {
  networkEvents = networkEvents.filter(e => e.id !== id)
}

export function getEventsForPerson(personId: string): NetworkEvent[] {
  return networkEvents.filter(e => e.participants.includes(personId))
}

export function getEventsForRelationship(relationshipId: string): NetworkEvent[] {
  return networkEvents.filter(e =>
    e.impacts.some(impact => impact.relationshipId === relationshipId)
  )
}

// Helper to find relationship between two people
export function findRelationship(person1Id: string, person2Id: string): Relationship | undefined {
  return relationships.find(
    r => (r.person1Id === person1Id && r.person2Id === person2Id) ||
      (r.person1Id === person2Id && r.person2Id === person1Id)
  )
}

export function initializeWithSampleData(): void {
  if (people.length > 0) return

  people = [
    { id: "1", name: "Alex", x: 300, y: 200 },
    { id: "2", name: "Jordan", x: 500, y: 150 },
    { id: "3", name: "Sam", x: 400, y: 350 },
    { id: "4", name: "Casey", x: 200, y: 300 },
  ]

  relationships = [
    {
      id: "r1",
      person1Id: "1",
      person2Id: "2",
      type: "Marriage",
      healthScore: 65,
      events: [
        {
          id: "e1",
          type: "positive",
          category: "Trip Together",
          description: "Anniversary trip to Paris",
          impact: 18,
          date: "2025-06-15",
        },
        {
          id: "e2",
          type: "negative",
          category: "Argument",
          description: "Disagreement about finances",
          impact: -8,
          date: "2025-08-20",
        },
        {
          id: "e3",
          type: "positive",
          category: "Support",
          description: "Helped during work crisis",
          impact: 12,
          date: "2025-10-05",
        },
      ],
    },
    {
      id: "r2",
      person1Id: "1",
      person2Id: "3",
      type: "Best Friend",
      healthScore: 80,
      events: [
        {
          id: "e4",
          type: "positive",
          category: "Quality Time",
          description: "Weekly game nights",
          impact: 8,
          date: "2025-09-01",
        },
        {
          id: "e5",
          type: "positive",
          category: "Gift",
          description: "Thoughtful birthday present",
          impact: 10,
          date: "2025-11-12",
        },
      ],
    },
    {
      id: "r3",
      person1Id: "2",
      person2Id: "4",
      type: "Colleague",
      healthScore: 45,
      events: [
        {
          id: "e6",
          type: "negative",
          category: "Lie",
          description: "Took credit for shared work",
          impact: -12,
          date: "2025-07-22",
        },
        {
          id: "e7",
          type: "positive",
          category: "Apology",
          description: "Sincere apology and correction",
          impact: 15,
          date: "2025-07-30",
        },
      ],
    },
    {
      id: "r4",
      person1Id: "3",
      person2Id: "4",
      type: "Family",
      healthScore: 30,
      events: [
        {
          id: "e8",
          type: "negative",
          category: "Fight",
          description: "Heated argument at family dinner",
          impact: -15,
          date: "2025-12-25",
        },
        {
          id: "e9",
          type: "negative",
          category: "Neglect",
          description: "Forgot important milestone",
          impact: -5,
          date: "2025-11-15",
        },
      ],
    },
  ]
}
