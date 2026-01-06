"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, ImagePlus, X } from "lucide-react"

interface AddPersonDialogProps {
  onAddPerson: (name: string, avatar?: string) => void
}

export function AddPersonDialog({ onAddPerson }: AddPersonDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState<string | undefined>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onAddPerson(name.trim(), avatar)
      setName("")
      setAvatar(undefined)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Person
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Person</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Photo (optional)</Label>
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatar ? (
                  <img src={avatar || "/placeholder.svg"} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {avatar && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAvatar(undefined)}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter person's name"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Add Person
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
