"use client"

import type { Person, Relationship, RelationshipEvent, NetworkEvent } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AddEventDialog } from "./add-event-dialog"
import { X, TrendingUp, TrendingDown, Minus, Trash2, Heart, Sparkles } from "lucide-react"

interface RelationshipDetailPanelProps {
  relationship: Relationship
  people: Person[]
  networkEvents: NetworkEvent[]
  onClose: () => void
  onAddEvent: (relationshipId: string, event: Omit<RelationshipEvent, "id">) => void
  onDeleteRelationship: (id: string) => void
}

export function RelationshipDetailPanel({
  relationship,
  people,
  networkEvents,
  onClose,
  onAddEvent,
  onDeleteRelationship,
}: RelationshipDetailPanelProps) {
  const person1 = people.find((p) => p.id === relationship.person1Id)
  const person2 = people.find((p) => p.id === relationship.person2Id)

  const getHealthIcon = (score: number) => {
    if (score >= 20) return <TrendingUp className="h-4 w-4 text-green-400" />
    if (score <= -20) return <TrendingDown className="h-4 w-4 text-red-400" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getHealthLabel = (score: number): string => {
    if (score >= 60) return "Thriving"
    if (score >= 20) return "Good"
    if (score >= -20) return "Neutral"
    if (score >= -60) return "Strained"
    return "Critical"
  }

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (!person1 || !person2) return null

  return (
    <Card className="w-96 h-full bg-card border-border flex flex-col">
      <CardHeader className="flex-shrink-0 flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="h-5 w-5 text-pink-400" />
            <CardTitle className="text-xl">{relationship.type}</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            {person1.name} & {person2.name}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onDeleteRelationship(relationship.id)
              onClose()
            }}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center text-lg font-semibold text-white overflow-hidden">
                  {person1.avatar ? (
                    <img
                      src={person1.avatar || "/placeholder.svg"}
                      alt={person1.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    person1.name.slice(0, 2)
                  )}
                </div>
                <span className="text-sm font-medium mt-2">{person1.name}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-0.5 w-12 bg-border" />
                <Badge variant="outline" className="my-2">
                  {relationship.type}
                </Badge>
                <div className="h-0.5 w-12 bg-border" />
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center text-lg font-semibold text-white overflow-hidden">
                  {person2.avatar ? (
                    <img
                      src={person2.avatar || "/placeholder.svg"}
                      alt={person2.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    person2.name.slice(0, 2)
                  )}
                </div>
                <span className="text-sm font-medium mt-2">{person2.name}</span>
              </div>
            </div>

            {/* Health score */}
            <div className="flex items-center gap-2 p-4 rounded-lg bg-secondary/50">
              {getHealthIcon(relationship.healthScore)}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{getHealthLabel(relationship.healthScore)}</span>
                  <span className="text-sm text-muted-foreground">{relationship.healthScore}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${Math.max(0, (relationship.healthScore + 100) / 2)}%`,
                      backgroundColor:
                        relationship.healthScore >= 20
                          ? "#4ade80"
                          : relationship.healthScore <= -20
                            ? "#f87171"
                            : "#94a3b8",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Events header */}
            <div className="flex justify-between items-center pt-2">
              <p className="text-sm font-medium">Event History</p>
              <AddEventDialog relationshipId={relationship.id} onAddEvent={onAddEvent} />
            </div>
            {/* Events list */}
            {relationship.events.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No events recorded yet. Add events to track how this relationship evolves.
              </p>
            ) : (
              <div className="space-y-2">
                {[...relationship.events].reverse().map((event) => (
                  <div key={event.id} className="p-3 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${event.type === "positive"
                              ? "bg-green-400"
                              : event.type === "negative"
                                ? "bg-red-400"
                                : "bg-slate-400"
                            }`}
                        />
                        <span className="text-sm font-medium">{event.category}</span>
                      </div>
                      <Badge
                        variant={
                          event.type === "positive"
                            ? "default"
                            : event.type === "negative"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {event.impact > 0 ? "+" : ""}
                        {event.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{event.description}</p>
                    {event.image && (
                      <div className="my-2 rounded-lg overflow-hidden">
                        <img
                          src={event.image || "/placeholder.svg"}
                          alt={event.category}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}
                    {event.changesRelationshipTo && (
                      <div className="flex items-center gap-1 text-xs text-amber-400 mb-1">
                        <Sparkles className="h-3 w-3" />
                        Changed relationship to {event.changesRelationshipTo}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
                  </div>
                ))}
              </div>
            )}
            {/* Network Events / Ripple Effects Section */}
            {networkEvents.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-sm font-medium">Network Ripple Effects</p>
                </div>
                <div className="space-y-2">
                  {networkEvents.slice().reverse().map((event) => {
                    const impact = event.impacts.find(i => i.relationshipId === relationship.id);
                    return (
                      <div key={event.id} className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-sm font-medium">{event.category}</span>
                          <Badge
                            variant={impact && impact.impact > 0 ? "default" : impact && impact.impact < 0 ? "destructive" : "secondary"}
                            className="text-xs bg-indigo-500/20 text-indigo-300 border-none"
                          >
                            {impact && impact.impact > 0 ? "+" : ""}{impact?.impact}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{event.description}</p>
                        <p className="text-[10px] text-muted-foreground">{formatDate(event.date)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
