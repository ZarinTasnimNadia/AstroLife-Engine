"use client"

import { useEffect, useState } from "react"
import { KnowledgeGraph } from "@/components/knowledge-graph"
import { Loader2 } from "lucide-react"
import { Navigation } from "@/components/navigation"

interface Publication {
  title: string
  authors: string
  year: string
  keywords: string
  doi: string
  pmcid: string
}

export default function GraphPage() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPublications() {
      try {
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
      } catch (error) {
        console.error("Error fetching publications:", error)
        setPublications([])
      } finally {
        setLoading(false)
      }
    }

    fetchPublications()
  }, [])

  return (
    <div className="min-h-screen cosmic-bg">
      <div className="mars"></div>
      <div className="moon"></div>

      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
            Knowledge Graph Explorer
          </h1>
          <p className="text-lg text-muted-foreground">
            Visualize connections between publications, authors, and research topics
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Building knowledge graph...</p>
            </div>
          </div>
        ) : (
          <KnowledgeGraph publications={publications} />
        )}
      </main>
    </div>
  )
}
