export async function POST(req: Request) {
  const { title, abstract, authors, year } = await req.json()

  if (!abstract || abstract === "Abstract not available") {
    return Response.json({
      summary: "Summary unavailable - no abstract provided for this publication.",
    })
  }

  // Simple extractive summarization: take first 2-3 sentences
  const summary = generateSimpleSummary(abstract, title)

  return Response.json({ summary })
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
