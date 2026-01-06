"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link, SwatchBook } from "lucide-react"
import { type Person, RELATIONSHIP_TYPES, type Relationship } from "@/lib/types"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"

interface AddRelationshipDialogProps {
  people: Person[]
  onAddRelationship: (person1Id: string, person2Id: string, type: string, extra?: Partial<Relationship>) => void
}

export function AddRelationshipDialog({ people, onAddRelationship }: AddRelationshipDialogProps) {
  const [open, setOpen] = useState(false)
  const [person1, setPerson1] = useState("")
  const [person2, setPerson2] = useState("")
  const [type, setType] = useState(RELATIONSHIP_TYPES[4]) // Default to Friend
  const [isAsymmetric, setIsAsymmetric] = useState(false)
  const [p1ToP2Type, setP1ToP2Type] = useState(RELATIONSHIP_TYPES[4])
  const [p2ToP1Type, setP2ToP1Type] = useState(RELATIONSHIP_TYPES[4])
  const [p1ToP2Health, setP1ToP2Health] = useState(50)
  const [p2ToP1Health, setP2ToP1Health] = useState(50)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (person1 && person2 && type && person1 !== person2) {
      if (isAsymmetric) {
        onAddRelationship(person1, person2, type, {
          p1ToP2Type,
          p2ToP1Type,
          p1ToP2Health,
          p2ToP1Health,
        })
      } else {
        onAddRelationship(person1, person2, type)
      }
      setPerson1("")
      setPerson2("")
      setType(RELATIONSHIP_TYPES[4])
      setIsAsymmetric(false)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2 bg-transparent">
          <Link className="h-4 w-4" />
          Add Relationship
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Relationship</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Person 1</Label>
            <Select value={person1} onValueChange={setPerson1}>
              <SelectTrigger>
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent>
                {people.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Person 2</Label>
            <Select value={person2} onValueChange={setPerson2}>
              <SelectTrigger>
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent>
                {people
                  .filter((p) => p.id !== person1)
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 py-2">
            <Switch id="asymmetric-mode" checked={isAsymmetric} onCheckedChange={setIsAsymmetric} />
            <Label htmlFor="asymmetric-mode" className="text-sm cursor-pointer">Asymmetric Relationship (Directional Feelings)</Label>
          </div>

          {!isAsymmetric ? (
            <div className="space-y-2">
              <Label>Mutual Relationship Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase text-indigo-400">
                  {people.find(p => p.id === person1)?.name || "Person 1"} → {people.find(p => p.id === person2)?.name || "Person 2"}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={p1ToP2Type} onValueChange={setP1ToP2Type}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="text-xs">
                          {t}
                        </SelectItem>
                      ))}
                      <SelectItem value="Crush" className="text-xs">Crush</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Initial Health ({p1ToP2Health})</Label>
                  <Input
                    type="number"
                    min="-100"
                    max="100"
                    value={p1ToP2Health}
                    onChange={e => setP1ToP2Health(parseInt(e.target.value) || 0)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-xs font-bold uppercase text-indigo-400">
                  {people.find(p => p.id === person2)?.name || "Person 2"} → {people.find(p => p.id === person1)?.name || "Person 1"}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={p2ToP1Type} onValueChange={setP2ToP1Type}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="text-xs">
                          {t}
                        </SelectItem>
                      ))}
                      <SelectItem value="Crush" className="text-xs">Crush</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Initial Health ({p2ToP1Health})</Label>
                  <Input
                    type="number"
                    min="-100"
                    max="100"
                    value={p2ToP1Health}
                    onChange={e => setP2ToP1Health(parseInt(e.target.value) || 0)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!person1 || !person2 || !type || person1 === person2}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
