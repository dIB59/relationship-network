"use client"

import { useState, useEffect, useCallback } from "react"
import { NetworkGraph } from "@/components/network-graph"
import { PersonDetailPanel } from "@/components/person-detail-panel"
import { RelationshipDetailPanel } from "@/components/relationship-detail-panel"
import { AddPersonDialog } from "@/components/add-person-dialog"
import { AddRelationshipDialog } from "@/components/add-relationship-dialog"
import type { Person, Relationship, RelationshipEvent } from "@/lib/types"
import {
  getPeople,
  getRelationships,
  addPerson,
  addRelationship,
  addEventToRelationship,
  deleteRelationship,
  deletePerson,
  getRelationshipsForPerson,
  initializeWithSampleData,
} from "@/lib/store"
import { Users, Link2, Link2Off } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function RelationshipNetworkApp() {
  const [people, setPeople] = useState<Person[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null)
  const [showLinks, setShowLinks] = useState(true)

  useEffect(() => {
    initializeWithSampleData()
    setPeople(getPeople())
    setRelationships(getRelationships())
  }, [])

  const handleAddPerson = useCallback((name: string, avatar?: string) => {
    const newPerson: Person = {
      id: Date.now().toString(),
      name,
      avatar,
      x: 200 + Math.random() * 400,
      y: 150 + Math.random() * 300,
    }
    addPerson(newPerson)
    setPeople(getPeople())
  }, [])

  const handleAddRelationship = useCallback((person1Id: string, person2Id: string, type: string) => {
    const newRelationship: Relationship = {
      id: Date.now().toString(),
      person1Id,
      person2Id,
      type,
      healthScore: 50,
      events: [],
    }
    addRelationship(newRelationship)
    setRelationships(getRelationships())
  }, [])

  const handleAddEvent = useCallback((relationshipId: string, event: Omit<RelationshipEvent, "id">) => {
    const newEvent: RelationshipEvent = {
      ...event,
      id: Date.now().toString(),
    }
    addEventToRelationship(relationshipId, newEvent)
    setRelationships(getRelationships())
  }, [])

  const handleDeleteRelationship = useCallback((id: string) => {
    deleteRelationship(id)
    setRelationships(getRelationships())
    setSelectedRelationshipId(null)
  }, [])

  const handleDeletePerson = useCallback((id: string) => {
    deletePerson(id)
    setPeople(getPeople())
    setRelationships(getRelationships())
    setSelectedPersonId(null)
  }, [])

  const handleSelectPerson = useCallback((id: string | null) => {
    console.log("[v0] handleSelectPerson called with:", id)
    setSelectedRelationshipId(null)
    setSelectedPersonId(id)
  }, [])

  const handleSelectRelationship = useCallback((id: string | null) => {
    console.log("[v0] handleSelectRelationship called with:", id)
    setSelectedPersonId(null)
    setSelectedRelationshipId(id)
  }, [])

  const selectedPerson = people.find((p) => p.id === selectedPersonId)
  const selectedPersonRelationships = selectedPersonId ? getRelationshipsForPerson(selectedPersonId) : []
  const selectedRelationship = relationships.find((r) => r.id === selectedRelationshipId)

  console.log(
    "[v0] Current state - selectedPersonId:",
    selectedPersonId,
    "selectedRelationshipId:",
    selectedRelationshipId,
  )
  console.log("[v0] selectedPerson:", selectedPerson?.name, "selectedRelationship:", selectedRelationship?.type)

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Relationship Network</h1>
              <p className="text-sm text-muted-foreground">Track and visualize your connections</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {showLinks ? (
                <Link2 className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Link2Off className="h-4 w-4 text-muted-foreground" />
              )}
              <Label htmlFor="show-links" className="text-sm text-muted-foreground">
                Links
              </Label>
              <Switch id="show-links" checked={showLinks} onCheckedChange={setShowLinks} />
            </div>
            <div className="h-6 w-px bg-border" />
            <AddPersonDialog onAddPerson={handleAddPerson} />
            <AddRelationshipDialog people={people} onAddRelationship={handleAddRelationship} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Graph area */}
        <div className="flex-1 p-4">
          <div className="h-full rounded-xl overflow-hidden border border-border">
            <NetworkGraph
              people={people}
              relationships={relationships}
              selectedPersonId={selectedPersonId}
              selectedRelationshipId={selectedRelationshipId}
              showLinks={showLinks}
              onSelectPerson={handleSelectPerson}
              onSelectRelationship={handleSelectRelationship}
            />
          </div>
        </div>

        {selectedPerson && (
          <div key={`person-${selectedPersonId}`} className="flex-shrink-0 border-l border-border">
            <PersonDetailPanel
              person={selectedPerson}
              people={people}
              relationships={selectedPersonRelationships}
              onClose={() => setSelectedPersonId(null)}
              onAddEvent={handleAddEvent}
              onDeleteRelationship={handleDeleteRelationship}
              onDeletePerson={handleDeletePerson}
            />
          </div>
        )}

        {selectedRelationship && (
          <div key={`rel-${selectedRelationshipId}`} className="flex-shrink-0 border-l border-border">
            <RelationshipDetailPanel
              relationship={selectedRelationship}
              people={people}
              onClose={() => setSelectedRelationshipId(null)}
              onAddEvent={handleAddEvent}
              onDeleteRelationship={handleDeleteRelationship}
            />
          </div>
        )}
      </div>

      {/* Footer hint */}
      <footer className="flex-shrink-0 border-t border-border bg-card px-6 py-3">
        <p className="text-xs text-muted-foreground text-center">
          Click a node to view all relationships • Click a link to see events for that relationship • Toggle links
          visibility in the header
        </p>
      </footer>
    </div>
  )
}
