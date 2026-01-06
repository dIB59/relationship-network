"use client"

import type { Person, Relationship } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AddEventDialog } from "./add-event-dialog"
import { X, TrendingUp, TrendingDown, Minus, Trash2, Sparkles, Users, Activity } from "lucide-react"
import type { RelationshipEvent, NetworkEvent } from "@/lib/types"

interface PersonDetailPanelProps {
  person: Person
  people: Person[]
  relationships: Relationship[]
  networkEvents: NetworkEvent[]
  onClose: () => void
  onAddEvent: (relationshipId: string, event: Omit<RelationshipEvent, "id">) => void
  onDeleteRelationship: (id: string) => void
  onDeletePerson: (id: string) => void
}

export function PersonDetailPanel({
  person,
  people,
  relationships,
  networkEvents,
  onClose,
  onAddEvent,
  onDeleteRelationship,
  onDeletePerson,
}: PersonDetailPanelProps) {
  const getOtherPerson = (rel: Relationship): Person | undefined => {
    const otherId = rel.person1Id === person.id ? rel.person2Id : rel.person1Id
    return people.find((p) => p.id === otherId)
  }

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

  return (
    <Card className="w-96 h-full bg-card border-border flex flex-col">
      <CardHeader className="flex-shrink-0 flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-lg font-semibold text-white overflow-hidden">
            {person.avatar ? (
              <img src={person.avatar || "/placeholder.svg"} alt={person.name} className="w-full h-full object-cover" />
            ) : (
              person.name.slice(0, 2)
            )}
          </div>
          <div>
            <CardTitle className="text-xl">{person.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {relationships.length} relationship{relationships.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeletePerson(person.id)}
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
          {relationships.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">
              No relationships yet. Create one using the &quot;Add Relationship&quot; button above.
            </p>
          ) : (
            <div className="space-y-6">
              {/* Network Events Section */}
              {networkEvents.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Activity className="h-4 w-4" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Network Events</h3>
                  </div>
                  <div className="space-y-3">
                    {networkEvents.slice().reverse().map((event) => (
                      <div key={event.id} className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-indigo-400" />
                            <span className="text-sm font-semibold">{event.category}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
                        </div>
                        <p className="text-sm text-indigo-100/80 mb-2">{event.description}</p>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {event.participants.map(pId => {
                            const p = people.find(person => person.id === pId);
                            if (!p) return null;
                            return (
                              <Badge key={pId} variant="secondary" className="text-[10px] py-0 px-1 bg-indigo-500/20 text-indigo-200 border-none">
                                {p.name}
                              </Badge>
                            );
                          })}
                        </div>

                        {/* Ripple Impacts specifically involving this person */}
                        <div className="space-y-1 pt-2 border-t border-indigo-500/10">
                          {event.impacts
                            .filter(impact => {
                              const rel = relationships.find(r => r.id === impact.relationshipId);
                              return rel && (rel.person1Id === person.id || rel.person2Id === person.id);
                            })
                            .map((impact, idx) => {
                              const rel = relationships.find(r => r.id === impact.relationshipId);
                              const otherId = rel?.person1Id === person.id ? rel?.person2Id : rel?.person1Id;
                              const otherName = people.find(p => p.id === otherId)?.name || "Unknown";
                              return (
                                <div key={idx} className="flex items-center justify-between text-[11px]">
                                  <span className="text-indigo-300/70">Impact on {otherName}</span>
                                  <span className={impact.impact > 0 ? "text-green-400" : "text-red-400"}>
                                    {impact.impact > 0 ? "+" : ""}{impact.impact}
                                  </span>
                                </div>
                              );
                            })
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-b border-border pt-2" />
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider">Relationships</h3>
                </div>
                {relationships.map((rel) => {
                  const otherPerson = getOtherPerson(rel)
                  if (!otherPerson) return null

                  return (
                    <div key={rel.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium overflow-hidden">
                            {otherPerson.avatar ? (
                              <img
                                src={otherPerson.avatar || "/placeholder.svg"}
                                alt={otherPerson.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              otherPerson.name.slice(0, 2)
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{otherPerson.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {rel.type}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteRelationship(rel.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                        {getHealthIcon(rel.healthScore)}
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">{getHealthLabel(rel.healthScore)}</span>
                            <span className="text-sm text-muted-foreground">{rel.healthScore}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${Math.max(0, (rel.healthScore + 100) / 2)}%`,
                                backgroundColor:
                                  rel.healthScore >= 20 ? "#4ade80" : rel.healthScore <= -20 ? "#f87171" : "#94a3b8",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-muted-foreground">Events</p>
                        <AddEventDialog relationshipId={rel.id} onAddEvent={onAddEvent} />
                      </div>

                      {rel.events.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">No events recorded yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {[...rel.events].reverse().map((event) => (
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
                                  Changed to {event.changesRelationshipTo}
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="border-b border-border" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
