import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

interface Publication {
  title: string
  authors: string
  year: string
  keywords: string
  doi: string
  pmcid: string
  abstract?: string
  aiSummary?: string
}

function generateSimpleSummary(abstract: string, title: string): string {
  // Clean up the abstract
  const cleanAbstract = abstract.trim()

  // Split into sentences (simple approach)
  const sentences = cleanAbstract
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20) // Filter out very short fragments

  if (sentences.length === 0) {
    return "This publication explores topics related to space biology research."
  }

  // Take first 2 sentences for a concise summary
  const summarySentences = sentences.slice(0, 2)

  return summarySentences.join(". ") + "."
}

// This function generates a summary for a single publication
async function generateSummaryForPublication(publication: Publication): Promise<string> {
  const { title, abstract } = publication

  if (!abstract || abstract === "Abstract not available") {
    return "Summary unavailable - no abstract provided for this publication."
  }

  try {
    return generateSimpleSummary(abstract, title)
  } catch (error) {
    console.error(`Error generating summary for publication "${title}":`, error)
    return "Failed to generate summary due to an error."
  }
}

export async function POST(req: Request) {
  try {
    const { publications } = await req.json()

    if (!Array.isArray(publications) || publications.length === 0) {
      return NextResponse.json({ error: "Invalid or empty publications array" }, { status: 400 })
    }

    // Process publications in batches
    const batchSize = 10 // Can process more since we're not using AI
    const publicationsWithSummaries: Publication[] = []

    for (let i = 0; i < publications.length; i += batchSize) {
      const batch = publications.slice(i, i + batchSize)

      // Process each publication in the batch concurrently
      const summaryPromises = batch.map(async (pub: Publication) => {
        const summary = await generateSummaryForPublication(pub)
        return { ...pub, aiSummary: summary }
      })

      const batchResults = await Promise.all(summaryPromises)
      publicationsWithSummaries.push(...batchResults)
    }

    return NextResponse.json({ publications: publicationsWithSummaries })
  } catch (error) {
    console.error("Error processing batch summaries:", error)
    return NextResponse.json(
      { error: "Failed to generate summaries", details: (error as Error).message },
      { status: 500 },
    )
  }
}
