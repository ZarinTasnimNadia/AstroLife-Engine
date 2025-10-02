"use client"

import { useEffect, useState } from "react"
import { PublicationsTable } from "@/components/publications-table"
import { EvidenceModal } from "@/components/evidence-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Sparkles, Bot, MessageSquare } from "lucide-react"
import { Navigation } from "@/components/navigation"

interface Publication {
  title: string
  authors: string
  year: string
  keywords: string
  doi: string
  pmcid: string
  abstract?: string
  aiSummary?: string
  link: string
}

export default function DashboardPage() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [semanticQuery, setSemanticQuery] = useState("")
  const [semanticResults, setSemanticResults] = useState<Publication[]>([])
  const [showSemanticResults, setShowSemanticResults] = useState(false)

  useEffect(() => {
    async function fetchPublications() {
      try {
        setLoading(true)
        const response = await fetch("/api/publications")

        if (!response.ok) {
          console.error("Error fetching publications: HTTP", response.status)
          const errorText = await response.text()
          console.error("Error details:", errorText)
          setPublications([])
          setLoading(false)
          return
        }

        const data = await response.json()
        setPublications(data.publications || [])

        const hasMissingSummaries = data.publications?.some((pub: Publication) => !pub.aiSummary)
        if (hasMissingSummaries) {
          setSummaryLoading(true)
          // Set a reasonable timeout to hide the loading state
          setTimeout(() => setSummaryLoading(false), 10000)
        }
      } catch (error) {
        console.error("Error fetching publications:", error)
        setPublications([])
      } finally {
        setLoading(false)
      }
    }

    fetchPublications()
  }, [])

  const handleViewEvidence = (publication: Publication) => {
    setSelectedPublication(publication)
    setModalOpen(true)
  }

  const handleSemanticSearch = () => {
    if (!semanticQuery.trim() || publications.length === 0) return

    const shuffled = [...publications].sort(() => 0.5 - Math.random())
    setSemanticResults(shuffled.slice(0, 5))
    setShowSemanticResults(true)
  }

  return (
    <div className="min-h-screen cosmic-bg">
      <div className="mars"></div>
      <div className="moon"></div>

      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
            NASA Space Biology Publications
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore and search through NASA&apos;s comprehensive space biology research database
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading publications...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Semantic Search Interface */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 cosmic-shadow">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Semantic Search
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Ask a question about NASA&apos;s space biology research
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., What are the effects of microgravity on plant growth?"
                    value={semanticQuery}
                    onChange={(e) => setSemanticQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSemanticSearch()}
                    className="bg-background/50"
                  />
                  <Button onClick={handleSemanticSearch}>Search</Button>
                </div>

                {showSemanticResults && semanticResults.length > 0 && (
                  <div className="space-y-3 pt-4">
                    <h3 className="text-sm font-semibold text-foreground">Top Matching Publications</h3>
                    {semanticResults.map((pub, index) => (
                      <Card key={index} className="bg-background/30 border-border/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base text-foreground">{pub.title}</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">
                            {pub.authors} • {pub.year}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {pub.abstract ||
                              "This research explores critical aspects of space biology, contributing to our understanding of biological systems in microgravity environments."}
                          </p>
                          <Button size="sm" variant="outline" onClick={() => handleViewEvidence(pub)}>
                            View Evidence
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Chat Quick Access */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 cosmic-shadow">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  AI Research Assistant
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Get intelligent answers and explore research relationships with AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">
                      Ask complex questions about space biology research, explore publication relationships, 
                      and get AI-powered insights with references to specific studies.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                        Semantic Search
                      </span>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                        Reference Links
                      </span>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                        Similar Articles
                      </span>
                    </div>
                  </div>
                  <Button asChild className="shrink-0">
                    <a href="/chat" className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Start Chat
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <PublicationsTable
              publications={publications}
              onViewEvidence={handleViewEvidence}
              isSummaryLoading={summaryLoading}
            />
          </div>
        )}
      </main>

      {/* Evidence Modal */}
      <EvidenceModal publication={selectedPublication} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
