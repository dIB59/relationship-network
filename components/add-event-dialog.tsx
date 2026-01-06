"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { CalendarPlus, ImagePlus, X, Sparkles } from "lucide-react"
import { EVENT_CATEGORIES, type RelationshipEvent } from "@/lib/types"

interface AddEventDialogProps {
  relationshipId: string
  onAddEvent: (relationshipId: string, event: Omit<RelationshipEvent, "id">) => void
}

export function AddEventDialog({ relationshipId, onAddEvent }: AddEventDialogProps) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState("")
  const [customCategory, setCustomCategory] = useState("") // for custom event names
  const [isCustom, setIsCustom] = useState(false)
  const [customType, setCustomType] = useState<"positive" | "negative" | "neutral">("neutral")
  const [description, setDescription] = useState("")
  const [impact, setImpact] = useState<number[]>([0])
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [image, setImage] = useState<string | undefined>() // event image
  const [changesRelationshipTo, setChangesRelationshipTo] = useState<string>("") // relationship change
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedCategory = EVENT_CATEGORIES.find((c) => c.name === category)

  const handleCategoryChange = (value: string) => {
    if (value === "custom") {
      setIsCustom(true)
      setCategory("")
      setImpact([0])
      setChangesRelationshipTo("")
    } else {
      setIsCustom(false)
      setCategory(value)
      const cat = EVENT_CATEGORIES.find((c) => c.name === value)
      if (cat) {
        setImpact([cat.defaultImpact])
        setChangesRelationshipTo(cat.changesRelationshipTo || "")
      }
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const eventCategory = isCustom ? customCategory : category
    const eventType = isCustom ? customType : selectedCategory?.type || "neutral"

    if (eventCategory && description) {
      onAddEvent(relationshipId, {
        type: eventType,
        category: eventCategory,
        description,
        impact: impact[0],
        date,
        image,
        changesRelationshipTo: changesRelationshipTo || undefined,
      })
      // Reset form
      setCategory("")
      setCustomCategory("")
      setIsCustom(false)
      setCustomType("neutral")
      setDescription("")
      setImpact([0])
      setDate(new Date().toISOString().split("T")[0])
      setImage(undefined)
      setChangesRelationshipTo("")
      setOpen(false)
    }
  }

  const positiveEvents = EVENT_CATEGORIES.filter((c) => c.type === "positive" && !c.changesRelationshipTo)
  const negativeEvents = EVENT_CATEGORIES.filter((c) => c.type === "negative" && !c.changesRelationshipTo)
  const relationshipChangingEvents = EVENT_CATEGORIES.filter((c) => c.changesRelationshipTo)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Relationship Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Event Type</Label>
            <Select value={isCustom ? "custom" : category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    Custom Event...
                  </span>
                </SelectItem>

                <div className="px-2 py-1 text-xs text-muted-foreground font-medium mt-2">Positive Events</div>
                {positiveEvents.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      {c.name}
                    </span>
                  </SelectItem>
                ))}

                <div className="px-2 py-1 text-xs text-muted-foreground font-medium mt-2">Negative Events</div>
                {negativeEvents.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      {c.name}
                    </span>
                  </SelectItem>
                ))}

                <div className="px-2 py-1 text-xs text-muted-foreground font-medium mt-2">Relationship Changes</div>
                {relationshipChangingEvents.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${c.type === "positive" ? "bg-green-400" : "bg-red-400"}`}
                      />
                      {c.name}
                      <span className="text-xs text-muted-foreground">→ {c.changesRelationshipTo}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isCustom && (
            <>
              <div className="space-y-2">
                <Label>Custom Event Name</Label>
                <Input
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter event name..."
                />
              </div>
              <div className="space-y-2">
                <Label>Event Nature</Label>
                <Select
                  value={customType}
                  onValueChange={(v) => setCustomType(v as "positive" | "negative" | "neutral")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                        Positive
                      </span>
                    </SelectItem>
                    <SelectItem value="neutral">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        Neutral
                      </span>
                    </SelectItem>
                    <SelectItem value="negative">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        Negative
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Photo (optional)</Label>
            <div className="flex items-center gap-4">
              <div
                className="w-24 h-16 rounded-lg bg-secondary flex items-center justify-center overflow-hidden border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {image ? (
                  <img src={image || "/placeholder.svg"} alt="Event preview" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {image && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setImage(undefined)}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Impact: {impact[0] > 0 ? "+" : ""}
              {impact[0]}
            </Label>
            <Slider value={impact} onValueChange={setImpact} min={-30} max={30} step={1} className="py-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Very Negative</span>
              <span>Very Positive</span>
            </div>
          </div>

          {changesRelationshipTo && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                This event will change the relationship to: <strong>{changesRelationshipTo}</strong>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCustom ? !customCategory || !description : !category || !description}>
              Add Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
