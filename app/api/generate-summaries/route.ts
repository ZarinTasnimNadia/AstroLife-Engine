import { NextResponse } from "next/server"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

export const dynamic = "force-dynamic"
export const maxDuration = 30

// Initialize Groq only if API key is available
const groq = process.env.GROQ_API_KEY ? createGroq({
  apiKey: process.env.GROQ_API_KEY,
}) : null

interface SummaryRequest {
  abstracts: Array<{
    id: string
    title: string
    abstract: string
  }>
}

export async function POST(req: Request) {
  try {
    const { abstracts }: SummaryRequest = await req.json()
    
    if (!abstracts || abstracts.length === 0) {
      return NextResponse.json(
        { error: "Abstracts array is required" },
        { status: 400 }
      )
    }

    // Check if Groq is available
    if (!groq || !process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "AI service not available" },
        { status: 503 }
      )
    }

    console.log(`[Summaries] Generating summaries for ${abstracts.length} abstracts`)

    // Create a single prompt for all abstracts to minimize API calls
    const abstractsText = abstracts.map((item, index) => 
      `${index + 1}. Title: ${item.title}\nAbstract: ${item.abstract}`
    ).join('\n\n')

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `You are an expert in space biology research. For each of the following ${abstracts.length} research abstracts, provide a concise 1-2 line summary that captures the key findings and significance.

IMPORTANT RULES:
- Keep each summary to exactly 1-2 lines
- Focus on the main finding or conclusion
- Use simple, clear language
- Number each summary to match the input (1, 2, 3, etc.)
- Be concise but informative

Abstracts:
${abstractsText}

Provide the summaries in this format:
1. [Summary for first abstract]
2. [Summary for second abstract]
3. [Summary for third abstract]
...`,
      maxOutputTokens: 800, // Limit tokens for efficiency
      temperature: 0.3, // Lower temperature for more consistent summaries
    })

    // Parse the response into individual summaries
    const summaries = text.split('\n')
      .filter(line => line.trim() && /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())

    // Create response object with summaries mapped to IDs
    const summaryMap: Record<string, string> = {}
    abstracts.forEach((item, index) => {
      summaryMap[item.id] = summaries[index] || "Summary not available"
    })

    console.log(`[Summaries] Generated ${summaries.length} summaries successfully`)
    
    return NextResponse.json({ summaries: summaryMap })
    
  } catch (error) {
    console.error("[Summaries] Error generating summaries:", error)
    
    return NextResponse.json(
      { error: "Failed to generate summaries" },
      { status: 500 }
    )
  }
}
