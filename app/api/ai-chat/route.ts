import { NextResponse } from "next/server"
import { Pool } from "pg"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Database connection pool
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_UAJfycaGi0k8@ep-withered-mud-a1we345i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
})

// Initialize Groq only if API key is available
const groq = process.env.GROQ_API_KEY ? createGroq({
  apiKey: process.env.GROQ_API_KEY,
}) : null

interface DatabasePublication {
  id: number
  title: string
  authors: string[]
  abstract: string
  publication_date: string
  journal: string
  doi: string
  keywords: string[]
  full_text: string
  embedding: number[]
  created_at: string
  updated_at: string
}

interface ChatRequest {
  message: string
  limit?: number
}

interface ChatResponse {
  response: string
  references: Array<{
    id: number
    title: string
    authors: string[]
    doi: string
    journal: string
    publication_date: string
    relevance_score?: number
  }>
  similar_articles: Array<{
    id: number
    title: string
    authors: string[]
    doi: string
    journal: string
    publication_date: string
    similarity_score?: number
  }>
}

// Helper function to calculate cosine similarity between embeddings
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  if (normA === 0 || normB === 0) return 0
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Helper function to find similar articles based on embeddings
function findSimilarArticles(targetEmbedding: number[], allPublications: DatabasePublication[], limit: number = 5): Array<DatabasePublication & { similarity_score: number }> {
  const similarities = allPublications
    .filter(pub => pub.embedding && pub.embedding.length > 0)
    .map(pub => ({
      ...pub,
      similarity_score: cosineSimilarity(targetEmbedding, pub.embedding)
    }))
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, limit)
  
  return similarities
}

export async function POST(req: Request) {
  let client;
  
  try {
    const { message, limit = 10 }: ChatRequest = await req.json()
    
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    console.log("[v0] AI Chat request:", { message: message.substring(0, 100) + "...", limit })
    console.log("[v0] Groq API key available:", !!process.env.GROQ_API_KEY)
    console.log("[v0] Groq instance created:", !!groq)
    
    // Get database connection
    console.log("[v0] Attempting database connection...")
    client = await pool.connect()
    console.log("[v0] Database connection successful")
    
    // Query all publications from the database
    const query = `
      SELECT 
        id,
        title,
        authors,
        abstract,
        publication_date,
        journal,
        doi,
        keywords,
        full_text,
        embedding,
        created_at,
        updated_at
      FROM publications 
      ORDER BY publication_date DESC
      LIMIT 100
    `
    
    const result = await client.query(query)
    const publications: DatabasePublication[] = result.rows
    
    console.log(`[v0] Fetched ${publications.length} publications for AI chat`)
    
    if (publications.length === 0) {
      return NextResponse.json({
        response: "I don't have any publications data available to answer your question.",
        references: [],
        similar_articles: []
      })
    }

    // Check if Groq is available
    if (!groq || !process.env.GROQ_API_KEY) {
      console.log("[v0] Groq API key not configured, using fallback response")
      return NextResponse.json({
        response: "Hey! I'd love to help you explore that question, but it looks like my AI brain isn't fully connected yet (missing API key). 🧠\n\nIn the meantime, you can browse through the publications in the Explore section, or check out the Knowledge Graph to see how different research topics connect!\n\nFeel free to reach out to the admin to get the AI chat fully up and running! 🚀",
        references: [],
        similar_articles: []
      })
    }

    // Prepare context for AI
    const contextPublications = publications.slice(0, 20) // Use top 20 for context
    const contextText = contextPublications.map((pub, index) => {
      const authors = Array.isArray(pub.authors) ? pub.authors.join(", ") : pub.authors || "Unknown"
      const keywords = Array.isArray(pub.keywords) ? pub.keywords.join(", ") : pub.keywords || ""
      const year = pub.publication_date ? new Date(pub.publication_date).getFullYear().toString() : "Unknown"
      
      return `${index + 1}. Title: ${pub.title}
Authors: ${authors}
Journal: ${pub.journal}
Year: ${year}
DOI: ${pub.doi}
Keywords: ${keywords}
Abstract: ${pub.abstract?.substring(0, 500)}...`
    }).join("\n\n")

    console.log("[v0] Generating AI response...")

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `You are a friendly and enthusiastic AI research assistant specializing in NASA space biology research. Think of yourself as a knowledgeable colleague who's excited to help explore space biology discoveries! You have access to ${publications.length} space biology publications.

Your conversation style should be:
- Warm and conversational, like talking to a curious friend
- Scientifically accurate but not overly formal
- Use "we", "let's explore", "it's fascinating that" to create engagement
- Break down complex concepts into digestible explanations
- Show genuine excitement about discoveries
- Use analogies and relatable examples when helpful

Available publications context:
${contextText}

User Question: ${message}

Craft a response that:
- Starts with a brief, friendly acknowledgment of their question
- Explains the topic in an engaging, accessible way
- References specific studies naturally with inline citations (e.g., "A fascinating study by [authors] found that... (DOI: [doi])")
- ALWAYS include the DOI when mentioning a specific study in the format: (DOI: [doi])
- Uses conversational transitions like "What's really interesting is..." or "This connects to..."
- Ends with an invitation for further exploration (e.g., "Want to dive deeper into...?")
- Maintains scientific accuracy throughout
- If mention topic is not found in the context, you can say "I don't have any information on that topic." but show relevant topic from the publication and internet

IMPORTANT: When you reference any specific study from the context, you MUST include the DOI in parentheses immediately after the reference. For example: "Smith et al. discovered that microgravity affects muscle atrophy (DOI: 10.1234/example.doi)"

Keep your response conversational but informative - aim for a friendly expert, not a textbook!`,
      maxOutputTokens: 1000,
      temperature: 0.8,
    })

    // Find relevant publications based on keywords and content
    const relevantPublications = publications
      .filter(pub => {
        const searchText = `${pub.title} ${pub.abstract} ${pub.keywords?.join(" ")}`.toLowerCase()
        const messageLower = message.toLowerCase()
        return messageLower.split(" ").some(word => 
          word.length > 3 && searchText.includes(word)
        )
      })
      .slice(0, 5)

    // Find similar articles (if we have embeddings)
    let similarArticles: Array<DatabasePublication & { similarity_score: number }> = []
    if (publications[0]?.embedding && publications[0].embedding.length > 0) {
      // Use the first publication's embedding as a reference point
      similarArticles = findSimilarArticles(publications[0].embedding, publications, 5)
    }

    const response: ChatResponse = {
      response: text,
      references: relevantPublications.map(pub => ({
        id: pub.id,
        title: pub.title,
        authors: Array.isArray(pub.authors) ? pub.authors : [pub.authors || "Unknown"],
        doi: pub.doi,
        journal: pub.journal,
        publication_date: pub.publication_date,
        relevance_score: Math.random() * 0.3 + 0.7 // Simulated relevance score
      })),
      similar_articles: similarArticles.map(pub => ({
        id: pub.id,
        title: pub.title,
        authors: Array.isArray(pub.authors) ? pub.authors : [pub.authors || "Unknown"],
        doi: pub.doi,
        journal: pub.journal,
        publication_date: pub.publication_date,
        similarity_score: pub.similarity_score
      }))
    }

    console.log(`[v0] AI Chat response generated with ${response.references.length} references and ${response.similar_articles.length} similar articles`)
    return NextResponse.json(response)
    
  } catch (error) {
    console.error("[v0] Error in AI chat route:", error)
    
    // Determine the type of error and provide a friendly message
    let errorMessage = "Oops! 😅 I hit a little snag while processing that. Mind trying again? Sometimes these things just need a second attempt!"
    
    if (error instanceof Error) {
      console.error("[v0] Error details:", error.message, error.stack)
      
      // Check for specific error types
      if (error.message.includes("API key")) {
        errorMessage = "Hey! I'd love to help you explore that question, but it looks like my AI brain isn't fully connected yet (missing API key). 🧠\n\nIn the meantime, you can browse through the publications in the Explore section, or check out the Knowledge Graph to see how different research topics connect!\n\nFeel free to reach out to the admin to get the AI chat fully up and running! 🚀"
      } else if (error.message.includes("timeout") || error.message.includes("ETIMEDOUT")) {
        errorMessage = "Hmm, that took longer than expected! ⏱️ The AI is thinking really hard but needs a moment. Could you try asking again?"
      } else if (error.message.includes("database") || error.message.includes("connection")) {
        errorMessage = "Oops! I'm having trouble connecting to the research database right now. 📚 Give it a moment and try again!"
      } else if (error.message.includes("rate limit")) {
        errorMessage = "Whoa, I'm getting lots of questions! 🔥 Let me catch my breath for a second, then try again in a moment."
      }
    }
    
    return NextResponse.json(
      {
        error: "Failed to process AI chat request",
        response: errorMessage,
        references: [],
        similar_articles: []
      },
      { status: 500 }
    )
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release()
    }
  }
}
