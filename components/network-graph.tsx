"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import type { Person, Relationship } from "@/lib/types"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

interface GraphNode {
  id: string
  name: string
  avatar?: string
}

interface GraphLink {
  source: string
  target: string
  relationshipId: string
}

interface NetworkGraphProps {
  people: Person[]
  relationships: Relationship[]
  selectedPersonId: string | null
  selectedRelationshipId: string | null
  showLinks: boolean
  onSelectPerson: (id: string | null) => void
  onSelectRelationship: (id: string | null) => void
}

export function NetworkGraph({
  people,
  relationships,
  selectedPersonId,
  selectedRelationshipId,
  showLinks,
  onSelectPerson,
  onSelectRelationship,
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<any>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map())

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
    const nodes: GraphNode[] = people.map((person) => ({
      id: person.id,
      name: person.name,
      avatar: person.avatar,
    }))

    const links: GraphLink[] = relationships.map((rel) => ({
      source: rel.person1Id,
      target: rel.person2Id,
      relationshipId: rel.id,
    }))

    setGraphData({ nodes, links })
  }, [people, relationships])

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
    (nodeId: string) => {
      return selectedPersonId === nodeId
    },
    [selectedPersonId],
  )

  const getLinkColor = useCallback(
    (relationshipId: string) => {
      const rel = relationships.find((r) => r.id === relationshipId)
      if (!rel) return "#64748b"
      if (selectedRelationshipId === relationshipId) return "#6495ed"
      return getHealthColor(rel.healthScore)
    },
    [relationships, selectedRelationshipId],
  )

  const getLinkWidth = useCallback(
    (relationshipId: string) => {
      return selectedRelationshipId === relationshipId ? 8 : 4
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

  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      if (node.x === undefined || node.y === undefined) return

      const selected = isNodeSelected(node.id)
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

  const visibleLinks = showLinks ? graphData.links : []

  if (graphData.nodes.length === 0) {
    return (
      <div className="w-full h-full bg-[#0f1419] rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Add people to start building your network</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-[#0f1419]">
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
        linkColor={(link: any) => getLinkColor(link.relationshipId)}
        linkWidth={(link: any) => getLinkWidth(link.relationshipId)}
        linkHoverPrecision={10}
        linkDirectionalParticles={0}
        onNodeClick={handleNodeClick}
        onLinkClick={handleLinkClick}
        onBackgroundClick={handleBackgroundClick}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        warmupTicks={50}
        enableNodeDrag={true}
        enableZoomPanInteraction={true}
      />
    </div>
  )
}
