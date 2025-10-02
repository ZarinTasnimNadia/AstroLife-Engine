import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

// Initialize Groq only if API key is available
const groq = process.env.GROQ_API_KEY ? createGroq({
  apiKey: process.env.GROQ_API_KEY,
}) : null

// Fallback summary generation function
function generateFallbackSummary(abstract: string, title: string): string {
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

  // Take first 2-3 sentences for a concise summary
  const summarySentences = sentences.slice(0, 3)

  return summarySentences.join(". ") + "."
}

export async function POST(req: Request) {
  try {
    const { title, abstract, authors, year } = await req.json()

    console.log("[v0] Groq summary request:", { title: title?.substring(0, 50) + "...", hasAbstract: !!abstract })

    if (!abstract || abstract === "Abstract not available" || abstract === "Abstract not available for this publication.") {
      return Response.json({
        summary: "Summary unavailable - no abstract provided for this publication.",
      })
    }

    // Check if Groq is available
    if (!groq || !process.env.GROQ_API_KEY) {
      console.log("[v0] Groq API key not configured, using fallback summary")
      const fallbackSummary = generateFallbackSummary(abstract, title)
      return Response.json({ summary: fallbackSummary })
    }

    console.log("[v0] Attempting to generate Groq summary...")

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `You are a scientific research assistant specializing in space biology and NASA research. 

Analyze the following research publication and provide a clear, concise summary that:
1. Explains the main research question or objective
2. Highlights key findings and results
3. Describes the significance for space biology and future missions
4. Uses accessible language while maintaining scientific accuracy

Publication Details:
Title: ${title}
Authors: ${authors}
Year: ${year}

Abstract:
${abstract}

Provide a 3-4 sentence summary that captures the essence of this research for both scientists and interested readers.`,
      maxOutputTokens: 300,
      temperature: 0.7,
    })

    console.log("[v0] Groq summary generated successfully")
    return Response.json({ summary: text })
  } catch (error) {
    console.error("[v0] Error generating Groq summary:", error)
    
    // Try to extract some data for fallback
    try {
      const { title, abstract } = await req.json()
      if (abstract && abstract !== "Abstract not available" && abstract !== "Abstract not available for this publication.") {
        console.log("[v0] Using fallback summary due to Groq error")
        const fallbackSummary = generateFallbackSummary(abstract, title)
        return Response.json({ summary: fallbackSummary })
      }
    } catch (fallbackError) {
      console.error("[v0] Error in fallback summary generation:", fallbackError)
    }
    
    return Response.json({ 
      error: "Failed to generate AI summary",
      summary: "Unable to generate summary at this time. Please try again later."
    }, { status: 500 })
  }
}
