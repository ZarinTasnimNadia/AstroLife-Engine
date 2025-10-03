"use client"

import { useEffect, useRef, useState } from "react"
import ForceGraph2D from "react-force-graph-2d"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, ExternalLink } from "lucide-react"

interface Publication {
  title: string
  authors: string
  year: string
  keywords: string | string[]
  doi: string
  pmcid: string
  link?: string
}

interface GraphNode {
  id: string
  name: string
  type: "publication" | "keyword" | "author"
  val: number
  color: string
  publication?: Publication
  relatedPublications?: string[]
  connectionCount?: number
}

interface GraphLink {
  source: string
  target: string
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

interface KnowledgeGraphProps {
  publications: Publication[]
}

export function KnowledgeGraph({ publications }: KnowledgeGraphProps) {
  const graphRef = useRef<any>()
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] })
  const [originalLinks, setOriginalLinks] = useState<GraphLink[]>([])
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById("graph-container")
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: Math.max(600, window.innerHeight - 300),
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    if (publications.length === 0) return

    const nodes: GraphNode[] = []
    const links: GraphLink[] = []
    const keywordMap = new Map<string, string[]>()
    const authorMap = new Map<string, string[]>()
    const publicationMap = new Map<string, Publication>()
    const yearKeywordMap = new Map<string, Set<string>>() // Track keywords by year

    // Use more publications for richer graph
    const sampledPubs = publications.slice(0, 100)

    sampledPubs.forEach((pub, index) => {
      const pubId = `pub-${index}`
      publicationMap.set(pubId, pub)
      nodes.push({
        id: pubId,
        name: pub.title,
        type: "publication",
        val: 6,
        color: "oklch(0.7 0.22 200)", // Blue for publications
        publication: pub,
      })

      // Extract keywords (handle both string and array)
      let keywords: string[] = []
      if (pub.keywords) {
        if (typeof pub.keywords === 'string') {
          keywords = pub.keywords
            .split(/[,;]/)
            .map((k) => k.trim())
            .filter((k) => k.length > 0)
        } else if (Array.isArray(pub.keywords)) {
          keywords = pub.keywords.map((k: any) => String(k).trim()).filter((k) => k.length > 0)
        }
      }

      // If no keywords, extract from title
      if (keywords.length === 0 && pub.title) {
        const titleLower = pub.title.toLowerCase()
        const topicKeywords = ["microgravity", "radiation", "plant", "cell", "bone", "muscle", "immune", "space", "mars", "moon", "ISS", "astronaut", "growth", "development"]
        topicKeywords.forEach(topic => {
          if (titleLower.includes(topic.toLowerCase())) {
            keywords.push(topic.charAt(0).toUpperCase() + topic.slice(1))
          }
        })
      }

      // Take up to 5 keywords per publication
      keywords.slice(0, 5).forEach((keyword) => {
        const normalizedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase()
        if (!keywordMap.has(normalizedKeyword)) {
          keywordMap.set(normalizedKeyword, [])
        }
        keywordMap.get(normalizedKeyword)!.push(pubId)

        // Track keywords by year for temporal connections
        if (pub.year) {
          if (!yearKeywordMap.has(pub.year)) {
            yearKeywordMap.set(pub.year, new Set())
          }
          yearKeywordMap.get(pub.year)!.add(normalizedKeyword)
        }
      })

      // Extract authors (take up to 3 per publication)
      if (pub.authors) {
        const authors = pub.authors
          .split(/[,;]/)
          .map((a) => a.trim())
          .filter((a) => a.length > 0)
          .slice(0, 3)

        authors.forEach((author) => {
          if (!authorMap.has(author)) {
            authorMap.set(author, [])
          }
          authorMap.get(author)!.push(pubId)
        })
      }
    })

    // Add keyword nodes (show keywords with at least 2 connections)
    const keywordEntries = Array.from(keywordMap.entries())
      .filter(([_, pubs]) => pubs.length >= 2)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 40) // Increased from 30

    keywordEntries.forEach(([keyword, pubIds]) => {
      const keywordId = `keyword-${keyword}`
      nodes.push({
        id: keywordId,
        name: keyword,
        type: "keyword",
        val: Math.min(pubIds.length * 2.5, 20), // Cap the size
        color: "oklch(0.75 0.25 310)", // Pink for keywords
        relatedPublications: pubIds,
        connectionCount: pubIds.length,
      })

      // Link keyword → publication
      pubIds.forEach((pubId) => {
        links.push({ source: keywordId, target: pubId })
      })
    })

    // Add author nodes (show authors with at least 2 publications)
    const authorEntries = Array.from(authorMap.entries())
      .filter(([_, pubs]) => pubs.length >= 2)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 30) // Increased from 20

    authorEntries.forEach(([author, pubIds]) => {
      const authorId = `author-${author}`
      nodes.push({
        id: authorId,
        name: author,
        type: "author",
        val: Math.min(pubIds.length * 2.5, 20), // Cap the size
        color: "oklch(0.7 0.2 150)", // Green for authors
        relatedPublications: pubIds,
        connectionCount: pubIds.length,
      })

      // Link publication → author
      pubIds.forEach((pubId) => {
        links.push({ source: pubId, target: authorId })
      })
    })

    // Create cross-links between keywords that often appear together
    const keywordIds = keywordEntries.map(([keyword]) => `keyword-${keyword}`)
    const keywordCooccurrence = new Map<string, Map<string, number>>()

    sampledPubs.forEach((pub) => {
      let keywords: string[] = []
      if (pub.keywords) {
        if (typeof pub.keywords === 'string') {
          keywords = pub.keywords.split(/[,;]/).map((k) => k.trim()).filter((k) => k.length > 0)
        } else if (Array.isArray(pub.keywords)) {
          keywords = pub.keywords.map((k: any) => String(k).trim()).filter((k) => k.length > 0)
        }
      }

      const normalizedKeywords = keywords.map(k => k.charAt(0).toUpperCase() + k.slice(1).toLowerCase())
      
      // Find co-occurring keywords
      for (let i = 0; i < normalizedKeywords.length; i++) {
        for (let j = i + 1; j < normalizedKeywords.length; j++) {
          const kw1 = `keyword-${normalizedKeywords[i]}`
          const kw2 = `keyword-${normalizedKeywords[j]}`
          
          if (keywordIds.includes(kw1) && keywordIds.includes(kw2)) {
            if (!keywordCooccurrence.has(kw1)) {
              keywordCooccurrence.set(kw1, new Map())
            }
            const coMap = keywordCooccurrence.get(kw1)!
            coMap.set(kw2, (coMap.get(kw2) || 0) + 1)
          }
        }
      }
    })

    // Add keyword-to-keyword links for strong co-occurrences
    keywordCooccurrence.forEach((coMap, kw1) => {
      coMap.forEach((count, kw2) => {
        if (count >= 3) { // Only link keywords that co-occur at least 3 times
          links.push({ source: kw1, target: kw2 })
        }
      })
    })

    console.log("[Knowledge Graph] Nodes:", nodes.length, "Links:", links.length)
    console.log("[Knowledge Graph] Keywords:", keywordEntries.length, "Authors:", authorEntries.length)

    setOriginalLinks(links)
    setGraphData({ nodes, links })
  }, [publications])

  const handleNodeClick = (node: any) => {
    setSelectedNode({
      id: node.id,
      name: node.name,
      type: node.type,
      val: node.val,
      color: node.color,
      publication: node.publication,
      relatedPublications: node.relatedPublications,
      connectionCount: node.connectionCount,
    } as GraphNode)
  }

  const getConnectionCount = (nodeId: string) => {
    return originalLinks.filter((link) => {
      const sourceId = typeof link.source === "string" ? link.source : (link.source as any).id
      const targetId = typeof link.target === "string" ? link.target : (link.target as any).id
      return sourceId === nodeId || targetId === nodeId
    }).length
  }

  const getConnectedNodes = (nodeId: string) => {
    const connectedIds = new Set<string>()
    originalLinks.forEach((link) => {
      const sourceId = typeof link.source === "string" ? link.source : (link.source as any).id
      const targetId = typeof link.target === "string" ? link.target : (link.target as any).id

      if (sourceId === nodeId) {
        connectedIds.add(targetId)
      } else if (targetId === nodeId) {
        connectedIds.add(sourceId)
      }
    })

    return Array.from(connectedIds)
      .map((id) => graphData.nodes.find((n) => n.id === id))
      .filter((n): n is GraphNode => n !== undefined)
      .slice(0, 5)
  }

  const getRelatedPublicationDetails = (node: GraphNode) => {
    if (!node.relatedPublications) return []
    return node.relatedPublications
      .slice(0, 3)
      .map((pubId) => graphData.nodes.find((n) => n.id === pubId))
      .filter((n): n is GraphNode => n !== undefined && n.publication !== undefined)
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Graph Visualization */}
      <div className="lg:col-span-2">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Knowledge Graph</CardTitle>
            <CardDescription className="text-muted-foreground">
              Interactive network showing research connections. Keywords link to related keywords, publications, and authors. Click any node to explore relationships.
            </CardDescription>
            <div className="flex items-center gap-6 pt-2 text-sm border-t border-border/30 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "oklch(0.75 0.25 310)" }} />
                <span className="text-muted-foreground font-medium">Keywords</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "oklch(0.7 0.22 200)" }} />
                <span className="text-muted-foreground font-medium">Publications</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "oklch(0.7 0.2 150)" }} />
                <span className="text-muted-foreground font-medium">Authors</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div id="graph-container" className="w-full rounded-lg overflow-hidden bg-background/50">
              {graphData.nodes.length > 0 ? (
                <ForceGraph2D
                  ref={graphRef}
                  graphData={graphData}
                  width={dimensions.width}
                  height={dimensions.height}
                  nodeLabel="name"
                  nodeColor="color"
                  nodeVal="val"
                  linkColor={() => "oklch(0.55 0.15 285)"}
                  linkWidth={2}
                  linkOpacity={0.7}
                  onNodeClick={handleNodeClick}
                  nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.name
                    const fontSize = 12 / globalScale
                    ctx.font = `${fontSize}px Sans-Serif`
                    ctx.textAlign = "center"
                    ctx.textBaseline = "middle"
                    ctx.fillStyle = node.color
                    ctx.beginPath()
                    ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false)
                    ctx.fill()

                    if (globalScale > 1.5) {
                      ctx.fillStyle = "oklch(0.98 0.01 265)"
                      ctx.fillText(label.substring(0, 20), node.x, node.y + node.val + fontSize)
                    }
                  }}
                  cooldownTicks={100}
                  backgroundColor="transparent"
                />
              ) : (
                <div className="flex items-center justify-center h-[600px]">
                  <p className="text-muted-foreground">Loading graph data...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 sticky top-24">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Node Details</CardTitle>
              {selectedNode && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <Badge
                    variant="secondary"
                    className={
                      selectedNode.type === "publication"
                        ? "bg-primary/20 text-primary"
                        : selectedNode.type === "keyword"
                          ? "bg-accent/20 text-accent"
                          : "bg-chart-4/20 text-chart-4"
                    }
                  >
                    {selectedNode.type}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {selectedNode.type === "publication" ? "Title" : "Name"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedNode.publication?.title || selectedNode.name}
                  </p>
                </div>

                {selectedNode.type === "publication" && selectedNode.publication && (
                  <>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Authors</h3>
                      <p className="text-sm text-muted-foreground">{selectedNode.publication.authors}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Year</h3>
                      <p className="text-sm text-muted-foreground">{selectedNode.publication.year}</p>
                    </div>

                    {selectedNode.publication.keywords && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Keywords</h3>
                        <p className="text-sm text-muted-foreground">{selectedNode.publication.keywords}</p>
                      </div>
                    )}

                    <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                      <a
                        href={
                          selectedNode.publication.link ||
                          `https://www.ncbi.nlm.nih.gov/pmc/articles/${selectedNode.publication.pmcid}/`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Full Text
                      </a>
                    </Button>
                  </>
                )}

                {(selectedNode.type === "keyword" || selectedNode.type === "author") && (
                  <>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Statistics</h3>
                      <p className="text-sm text-muted-foreground">
                        Appears in {selectedNode.connectionCount || getConnectionCount(selectedNode.id)} publications
                      </p>
                    </div>

                    {selectedNode.relatedPublications && selectedNode.relatedPublications.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Related Publications</h3>
                        <div className="space-y-2">
                          {getRelatedPublicationDetails(selectedNode).map((pubNode) => (
                            <div
                              key={pubNode.id}
                              className="text-xs p-2 rounded bg-background/50 border border-border/30 cursor-pointer hover:bg-background/70 transition-colors"
                              onClick={() => setSelectedNode(pubNode)}
                            >
                              <p className="text-foreground font-medium line-clamp-2 mb-1">
                                {pubNode.publication?.title}
                              </p>
                              <p className="text-muted-foreground text-[10px]">
                                {pubNode.publication?.authors.split(",")[0]} et al. • {pubNode.publication?.year}
                              </p>
                            </div>
                          ))}
                          {selectedNode.relatedPublications.length > 3 && (
                            <p className="text-xs text-muted-foreground italic">
                              +{selectedNode.relatedPublications.length - 3} more publications
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Connections</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Connected to {getConnectionCount(selectedNode.id)} other nodes
                  </p>

                  {getConnectionCount(selectedNode.id) > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Connected to:</p>
                      <div className="space-y-1">
                        {getConnectedNodes(selectedNode.id).map((node) => (
                          <div
                            key={node.id}
                            className="text-xs p-2 rounded bg-background/50 border border-border/30 cursor-pointer hover:bg-background/70 transition-colors"
                            onClick={() => setSelectedNode(node)}
                          >
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 mb-1">
                              {node.type}
                            </Badge>
                            <p className="text-muted-foreground line-clamp-2">{node.name}</p>
                          </div>
                        ))}
                        {getConnectionCount(selectedNode.id) > 5 && (
                          <p className="text-xs text-muted-foreground italic">
                            +{getConnectionCount(selectedNode.id) - 5} more connections
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Click on any node to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
