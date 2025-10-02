import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { title, abstract, authors, year } = await req.json()

    if (!abstract || abstract === "Abstract not available") {
      return Response.json({
        summary: "Summary unavailable - no abstract provided for this publication.",
      })
    }

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

    return Response.json({ summary: text })
  } catch (error) {
    console.error("[v0] Error generating Groq summary:", error)
    return Response.json({ error: "Failed to generate AI summary" }, { status: 500 })
  }
}
