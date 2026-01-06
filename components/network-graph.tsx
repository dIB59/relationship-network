"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import type { Person, Relationship } from "@/lib/types"
import { RELATIONSHIP_TYPES, type NetworkEvent } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

interface GraphNode {
  id: string
  name: string
  avatar?: string
  isEvent?: boolean
  eventType?: "positive" | "negative" | "neutral"
}

interface GraphLink {
  source?: string | any
  target?: string | any
  relationshipId?: string
  isEventLink?: boolean
}

interface NetworkGraphProps {
  people: Person[]
  relationships: Relationship[]
  networkEvents: NetworkEvent[]
  selectedPersonId: string | null
  selectedRelationshipId: string | null
  showLinks: boolean
  onSelectPerson: (id: string | null) => void
  onSelectRelationship: (id: string | null) => void
  onCreateRelationship: (person1Id: string, person2Id: string, type: string) => void
}

export function NetworkGraph({
  people,
  relationships,
  networkEvents,
  selectedPersonId,
  selectedRelationshipId,
  showLinks,
  onSelectPerson,
  onSelectRelationship,
  onCreateRelationship,
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<any>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map())

  // Drag-to-create relationship state
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    startNodeId: string | null
    currentPos: { x: number; y: number } | null
  }>({ isDragging: false, startNodeId: null, currentPos: null })
  const [showRelationshipDialog, setShowRelationshipDialog] = useState(false)
  const [pendingRelationship, setPendingRelationship] = useState<{
    person1Id: string
    person2Id: string
  } | null>(null)
  const [selectedRelationType, setSelectedRelationType] = useState<string>(RELATIONSHIP_TYPES[0])

  const getHealthColor = (score: number): string => {
    if (score >= 60) return "#22c55e"
    if (score >= 20) return "#eab308"
    if (score >= -20) return "#64748b"
    return "#ef4444"
  }

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    if (graphRef.current) {
      const fg = graphRef.current
      // Increase charge strength (more negative = more repulsion)
      fg.d3Force("charge")?.strength(-400)
      // Increase link distance
      fg.d3Force("link")?.distance(150)
      // Add center force to keep nodes from flying away
      fg.d3Force("center")?.strength(0.05)
    }
  }, [graphRef.current])

  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] })

  useEffect(() => {
    const personNodes: GraphNode[] = people.map((person) => ({
      id: person.id,
      name: person.name,
      avatar: person.avatar,
      isEvent: false
    }))

    const eventNodes: GraphNode[] = networkEvents.map((event) => ({
      id: `event-${event.id}`,
      name: event.category,
      isEvent: true,
      eventType: event.type
    }))

    const relLinks: GraphLink[] = relationships.map((rel) => ({
      source: rel.person1Id,
      target: rel.person2Id,
      relationshipId: rel.id,
    }))

    const eventLinks: GraphLink[] = []
    networkEvents.forEach(event => {
      event.participants.forEach(pId => {
        eventLinks.push({
          source: `event-${event.id}`,
          target: pId,
          isEventLink: true
        })
      })
    })

    setGraphData({
      nodes: [...personNodes, ...eventNodes],
      links: [...relLinks, ...eventLinks]
    })
  }, [people, relationships, networkEvents])

  useEffect(() => {
    people.forEach((person) => {
      if (person.avatar && !imageCache.current.has(person.id)) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = person.avatar
        img.onload = () => {
          imageCache.current.set(person.id, img)
        }
      }
    })
  }, [people])

  const getNodeColor = useCallback(
    (nodeId: string) => {
      return selectedPersonId === nodeId ? "#38bdf8" : "#6366f1"
    },
    [selectedPersonId],
  )

  const isNodeSelected = useCallback(
    (node: GraphNode) => {
      return selectedPersonId === node.id || (node.isEvent && selectedRelationshipId === node.id.replace('event-', ''))
    },
    [selectedPersonId, selectedRelationshipId],
  )

  const getLinkColor = useCallback(
    (link: GraphLink) => {
      if (link.isEventLink) return "rgba(129, 140, 248, 0.2)"
      const relationshipId = link.relationshipId
      const rel = relationships.find((r) => r.id === relationshipId)
      if (!rel) return "#64748b"
      if (selectedRelationshipId === relationshipId) return "#6495ed"
      return getHealthColor(rel.healthScore)
    },
    [relationships, selectedRelationshipId],
  )

  const getLinkWidth = useCallback(
    (link: GraphLink) => {
      if (link.isEventLink) return 1
      return selectedRelationshipId === link.relationshipId ? 8 : 4
    },
    [selectedRelationshipId],
  )

  const handleNodeClick = useCallback(
    (node: any) => {
      console.log("[v0] Node clicked:", node.id)
      onSelectRelationship(null)
      onSelectPerson(node.id)
    },
    [onSelectPerson, onSelectRelationship],
  )

  const handleLinkClick = useCallback(
    (link: any) => {
      console.log("[v0] Link clicked:", link.relationshipId)
      onSelectPerson(null)
      onSelectRelationship(link.relationshipId)
    },
    [onSelectRelationship, onSelectPerson],
  )

  const handleBackgroundClick = useCallback(() => {
    console.log("[v0] Background clicked")
    onSelectPerson(null)
    onSelectRelationship(null)
  }, [onSelectPerson, onSelectRelationship])

  const handleNodeRightClick = useCallback((node: any) => {
    // Right-click to start creating a relationship
    setDragState({
      isDragging: true,
      startNodeId: node.id,
      currentPos: { x: node.x, y: node.y }
    })
  }, [])

  const handleNodeClickForRelationship = useCallback((node: any) => {
    // If we're in drag mode and click a different node, create relationship
    if (dragState.isDragging && dragState.startNodeId && dragState.startNodeId !== node.id) {
      // Check if relationship already exists
      const existingRel = relationships.find(
        r => (r.person1Id === dragState.startNodeId && r.person2Id === node.id) ||
          (r.person1Id === node.id && r.person2Id === dragState.startNodeId)
      )

      if (!existingRel) {
        // Show dialog to select relationship type
        setPendingRelationship({
          person1Id: dragState.startNodeId,
          person2Id: node.id
        })
        setShowRelationshipDialog(true)
      }
      setDragState({ isDragging: false, startNodeId: null, currentPos: null })
      return
    }

    // Normal node click behavior
    console.log("[v0] Node clicked:", node.id)
    onSelectRelationship(null)
    onSelectPerson(node.id)
  }, [dragState.isDragging, dragState.startNodeId, relationships, onSelectPerson, onSelectRelationship])

  const handleCreateRelationship = useCallback(() => {
    if (pendingRelationship) {
      onCreateRelationship(
        pendingRelationship.person1Id,
        pendingRelationship.person2Id,
        selectedRelationType
      )
      setShowRelationshipDialog(false)
      setPendingRelationship(null)
      setSelectedRelationType(RELATIONSHIP_TYPES[0])
    }
  }, [pendingRelationship, selectedRelationType, onCreateRelationship])

  const handleCancelRelationship = useCallback(() => {
    setShowRelationshipDialog(false)
    setPendingRelationship(null)
    setSelectedRelationType(RELATIONSHIP_TYPES[0])
  }, [])

  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      if (node.x === undefined || node.y === undefined) return

      const selected = isNodeSelected(node)

      if (node.isEvent) {
        // Render Event Node as a Diamond
        const size = selected ? 10 : 8
        const color = node.eventType === "positive" ? "#4ade80" : node.eventType === "negative" ? "#f87171" : "#818cf8"

        ctx.save()
        ctx.translate(node.x, node.y)
        ctx.rotate(Math.PI / 4)

        // Glow for event
        ctx.beginPath()
        ctx.rect(-size / 2 - 2, -size / 2 - 2, size + 4, size + 4)
        ctx.fillStyle = node.eventType === "positive" ? "rgba(74, 222, 128, 0.1)" : "rgba(129, 140, 248, 0.1)"
        ctx.fill()

        ctx.beginPath()
        ctx.rect(-size / 2, -size / 2, size, size)
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = "rgba(255,255,255,0.8)"
        ctx.lineWidth = selected ? 2 : 1
        ctx.stroke()
        ctx.restore()

        if (selected || globalScale > 1.5) {
          const fontSize = 10 / globalScale
          ctx.font = `${fontSize}px Inter, sans-serif`
          ctx.textAlign = "center"
          ctx.textBaseline = "top"
          ctx.fillStyle = "#94a3b8"
          ctx.fillText(node.name, node.x, node.y + size + 2)
        }
        return
      }

      const nodeRadius = selected ? 16 : 12
      const fontSize = 12 / globalScale
      const label = node.name
      const color = getNodeColor(node.id)
      const cachedImage = imageCache.current.get(node.id)

      // Selection glow
      if (selected) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeRadius + 4, 0, 2 * Math.PI)
        ctx.fillStyle = "rgba(56, 189, 248, 0.3)"
        ctx.fill()
      }

      // Node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI)

      if (cachedImage) {
        ctx.save()
        ctx.clip()
        ctx.drawImage(cachedImage, node.x - nodeRadius, node.y - nodeRadius, nodeRadius * 2, nodeRadius * 2)
        ctx.restore()
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI)
      } else {
        ctx.fillStyle = color
        ctx.fill()
      }

      ctx.strokeStyle = selected ? "#fff" : "rgba(255,255,255,0.5)"
      ctx.lineWidth = selected ? 3 : 2
      ctx.stroke()

      // Label
      ctx.font = `${fontSize}px Inter, sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillStyle = "#e2e8f0"
      ctx.fillText(label, node.x, node.y + nodeRadius + 4)
    },
    [getNodeColor, isNodeSelected],
  )

  // Filter links based on selection: if a node is selected, show only its links
  const visibleLinks = showLinks
    ? selectedPersonId
      ? graphData.links.filter(link => {
        const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source
        const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target
        return sourceId === selectedPersonId || targetId === selectedPersonId
      })
      : graphData.links
    : []

  if (graphData.nodes.length === 0) {
    return (
      <div className="w-full h-full bg-[#0f1419] rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Add people to start building your network</p>
      </div>
    )
  }

  // Get start node position for drag line
  const startNode = dragState.startNodeId ? graphData.nodes.find(n => n.id === dragState.startNodeId) : null

  return (
    <>
      <div ref={containerRef} className="w-full h-full bg-[#0f1419] relative">
        <ForceGraph2D
          ref={graphRef}
          graphData={{ nodes: graphData.nodes, links: visibleLinks }}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#0f1419"
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={(node: any, color, ctx) => {
            if (node.x === undefined || node.y === undefined) return
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI)
            ctx.fill()
          }}
          linkColor={getLinkColor}
          linkWidth={getLinkWidth}
          linkHoverPrecision={10}
          linkDirectionalParticles={(link: any) => link.isEventLink ? 2 : 0}
          linkDirectionalParticleSpeed={0.01}
          linkDirectionalParticleWidth={2}
          onNodeClick={(node: any) => {
            if (node.isEvent) {
              onSelectPerson(null)
              onSelectRelationship(node.id.replace('event-', ''))
            } else {
              handleNodeClickForRelationship(node)
            }
          }}
          onNodeRightClick={handleNodeRightClick}
          onLinkClick={handleLinkClick}
          onBackgroundClick={handleBackgroundClick}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          warmupTicks={50}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
        />
      </div>

      {/* Relationship Type Selection Dialog */}
      <Dialog open={showRelationshipDialog} onOpenChange={setShowRelationshipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Relationship</DialogTitle>
            <DialogDescription>
              {pendingRelationship && (
                <>
                  Creating relationship between{" "}
                  <strong>{people.find(p => p.id === pendingRelationship.person1Id)?.name}</strong>
                  {" "}and{" "}
                  <strong>{people.find(p => p.id === pendingRelationship.person2Id)?.name}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="relationship-type">Relationship Type</Label>
              <Select value={selectedRelationType} onValueChange={setSelectedRelationType}>
                <SelectTrigger id="relationship-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelRelationship}>
              Cancel
            </Button>
            <Button onClick={handleCreateRelationship}>
              Create Relationship
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
