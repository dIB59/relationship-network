"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link } from "lucide-react"
import { type Person, RELATIONSHIP_TYPES } from "@/lib/types"

interface AddRelationshipDialogProps {
  people: Person[]
  onAddRelationship: (person1Id: string, person2Id: string, type: string) => void
}

export function AddRelationshipDialog({ people, onAddRelationship }: AddRelationshipDialogProps) {
  const [open, setOpen] = useState(false)
  const [person1, setPerson1] = useState("")
  const [person2, setPerson2] = useState("")
  const [type, setType] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (person1 && person2 && type && person1 !== person2) {
      onAddRelationship(person1, person2, type)
      setPerson1("")
      setPerson2("")
      setType("")
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
          <div className="space-y-2">
            <Label>Relationship Type</Label>
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
