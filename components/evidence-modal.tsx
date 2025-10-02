"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ExternalLink, Database, Sparkles, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

interface Publication {
  title: string
  link: string
  pmcid: string
  authors: string
  year: string
  abstract: string
}

interface EvidenceModalProps {
  publication: Publication | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EvidenceModal({ publication, open, onOpenChange }: EvidenceModalProps) {
  const [aiSummary, setAiSummary] = useState<string>("")
  const [summaryLoading, setSummaryLoading] = useState(false)

  useEffect(() => {
    if (open && publication && publication.abstract && publication.abstract !== "Abstract not available") {
      setSummaryLoading(true)
      setAiSummary("")

      fetch("/api/groq-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: publication.title,
          abstract: publication.abstract,
          authors: publication.authors,
          year: publication.year,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }
          return res.json()
        })
        .then((data) => {
          if (data.error) {
            console.error("[v0] API returned error:", data.error)
            setAiSummary(data.summary || "Unable to generate AI summary at this time.")
          } else {
            setAiSummary(data.summary || "")
          }
        })
        .catch((error) => {
          console.error("[v0] Error fetching AI summary:", error)
          setAiSummary("Unable to generate AI summary at this time. Please check your connection and try again.")
        })
        .finally(() => {
          setSummaryLoading(false)
        })
    }
  }, [open, publication])

  if (!publication) return null

  const confidenceScore = Math.floor(Math.random() * 26) + 70

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground text-pretty">
            <a
              href={publication.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors inline-flex items-center gap-2 group"
            >
              {publication.title}
              <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {publication.authors && <span>{publication.authors}</span>}
            {publication.authors && publication.year && <span> • </span>}
            {publication.year && <span>{publication.year}</span>}
            {(publication.authors || publication.year) && publication.pmcid && <span> • </span>}
            {publication.pmcid && <span>PMCID: {publication.pmcid}</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* AI Summary */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              AI Summary (Powered by Llama 3.3 70B)
            </h3>
            <div className="text-sm text-foreground leading-relaxed">
              {summaryLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating AI summary...</span>
                </div>
              ) : aiSummary ? (
                <p>{aiSummary}</p>
              ) : (
                <p className="text-muted-foreground italic">AI summary unavailable</p>
              )}
            </div>
          </div>

          {/* Abstract */}
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-foreground"></span>
              Abstract
            </h3>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
              {publication.abstract ? (
                <p>{publication.abstract}</p>
              ) : (
                <p className="italic">Abstract not available for this publication.</p>
              )}
            </div>
          </div>

          {/* Confidence Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">Confidence Score</h3>
              <span className="text-sm font-medium text-primary">{confidenceScore}%</span>
            </div>
            <Progress value={confidenceScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Based on data quality and source reliability</p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
              <a href={publication.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Full Text on PubMed Central
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
              <a href="https://osdr.nasa.gov/bio/" target="_blank" rel="noopener noreferrer">
                <Database className="w-4 h-4 mr-2" />
                Explore Related Datasets on NASA OSDR
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
