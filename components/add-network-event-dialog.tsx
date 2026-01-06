"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "lucide-react"
import { type Person, type Relationship, EVENT_CATEGORIES, type NetworkEvent } from "@/lib/types"
import { findRelationship } from "@/lib/store"

interface AddNetworkEventDialogProps {
    people: Person[]
    relationships: Relationship[]
    onAddEvent: (event: Omit<NetworkEvent, "id">) => void
}

export function AddNetworkEventDialog({ people, relationships, onAddEvent }: AddNetworkEventDialogProps) {
    const [open, setOpen] = useState(false)
    const [category, setCategory] = useState("")
    const [description, setDescription] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split("T")[0])
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
    const [customImpacts, setCustomImpacts] = useState<Record<string, number>>({})

    // Get the event category details
    const eventCategory = EVENT_CATEGORIES.find(c => c.name === category)

    // Calculate affected relationships based on selected participants
    const affectedRelationships = useMemo(() => {
        if (selectedParticipants.length < 2) return []

        const affected: { relationship: Relationship; defaultImpact: number }[] = []

        // Find all relationships between selected participants
        for (let i = 0; i < selectedParticipants.length; i++) {
            for (let j = i + 1; j < selectedParticipants.length; j++) {
                const rel = findRelationship(selectedParticipants[i], selectedParticipants[j])
                if (rel) {
                    affected.push({
                        relationship: rel,
                        defaultImpact: eventCategory?.defaultImpact || 0
                    })
                }
            }
        }

        return affected
    }, [selectedParticipants, eventCategory])

    const toggleParticipant = useCallback((personId: string) => {
        setSelectedParticipants(prev =>
            prev.includes(personId)
                ? prev.filter(id => id !== personId)
                : [...prev, personId]
        )
    }, [])

    const updateImpact = useCallback((relationshipId: string, impact: number) => {
        setCustomImpacts(prev => ({
            ...prev,
            [relationshipId]: impact
        }))
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!category || selectedParticipants.length < 2 || !description) return

        const impacts = affectedRelationships.map(({ relationship }) => ({
            relationshipId: relationship.id,
            impact: customImpacts[relationship.id] ?? (eventCategory?.defaultImpact || 0),
            reason: `Involved in: ${description}`
        }))

        const event: Omit<NetworkEvent, "id"> = {
            type: eventCategory?.type || "neutral",
            category,
            description,
            date,
            participants: selectedParticipants,
            impacts
        }

        onAddEvent(event)

        // Reset form
        setCategory("")
        setDescription("")
        setDate(new Date().toISOString().split("T")[0])
        setSelectedParticipants([])
        setCustomImpacts({})
        setOpen(false)
    }

    const getPersonName = (id: string) => people.find(p => p.id === id)?.name || "Unknown"

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Calendar className="h-4 w-4" />
                    Add Network Event
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Network Event</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Event Category */}
                    <div className="space-y-2">
                        <Label>Event Type</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                            <SelectContent>
                                {EVENT_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.name} value={cat.name}>
                                        {cat.name} ({cat.type === "positive" ? "+" : cat.type === "negative" ? "-" : "○"}{cat.defaultImpact})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What happened?"
                            rows={3}
                        />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    {/* Participants */}
                    <div className="space-y-2">
                        <Label>Participants ({selectedParticipants.length} selected)</Label>
                        <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                            {people.map((person) => (
                                <div key={person.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`participant-${person.id}`}
                                        checked={selectedParticipants.includes(person.id)}
                                        onCheckedChange={() => toggleParticipant(person.id)}
                                    />
                                    <label
                                        htmlFor={`participant-${person.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {person.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Affected Relationships */}
                    {affectedRelationships.length > 0 && (
                        <div className="space-y-2">
                            <Label>Ripple Effects ({affectedRelationships.length} relationships affected)</Label>
                            <div className="border rounded-md p-3 space-y-3 max-h-60 overflow-y-auto">
                                {affectedRelationships.map(({ relationship, defaultImpact }) => (
                                    <div key={relationship.id} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">
                                                {getPersonName(relationship.person1Id)} ↔ {getPersonName(relationship.person2Id)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {relationship.type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`impact-${relationship.id}`} className="text-xs">
                                                Impact:
                                            </Label>
                                            <Input
                                                id={`impact-${relationship.id}`}
                                                type="number"
                                                min="-10"
                                                max="10"
                                                value={customImpacts[relationship.id] ?? defaultImpact}
                                                onChange={(e) => updateImpact(relationship.id, parseInt(e.target.value) || 0)}
                                                className="w-20 h-8 text-sm"
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                (Current: {relationship.healthScore})
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!category || selectedParticipants.length < 2 || !description}
                        >
                            Create Event
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
