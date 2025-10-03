import { NextResponse } from "next/server"
import { Pool } from "pg"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Database connection pool
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_UAJfycaGi0k8@ep-withered-mud-a1we345i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
})

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

interface SearchRequest {
  query: string
  limit?: number
  threshold?: number
}

interface SearchResult {
  id: number
  title: string
  authors: string[]
  abstract: string
  publication_date: string
  journal: string
  doi: string
  keywords: string[]
  similarity_score: number
  relevance_explanation: string
}

// Helper function to calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  if (normA === 0 || normB === 0) {
    return 0
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Generate embedding for search query using HuggingFace API
async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    // Try HuggingFace first
    const hfResponse = await fetch('https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: query,
        options: { wait_for_model: true }
      })
    })

    if (hfResponse.ok) {
      const embedding = await hfResponse.json()
      if (Array.isArray(embedding) && embedding.length > 0) {
        return embedding[0]
      }
    }
  } catch (error) {
    console.log('[v0] HuggingFace embedding failed, trying Cohere...', error)
  }

  // Fallback to Cohere
  try {
    const cohereResponse = await fetch('https://api.cohere.ai/v1/embed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: [query],
        model: 'embed-english-v3.0',
        input_type: 'search_query'
      })
    })

    if (cohereResponse.ok) {
      const data = await cohereResponse.json()
      if (data.embeddings && data.embeddings.length > 0) {
        return data.embeddings[0]
      }
    }
  } catch (error) {
    console.log('[v0] Cohere embedding failed:', error)
  }

  // If both APIs fail, return empty array
  console.warn('[v0] All embedding APIs failed, returning empty embedding')
  return []
}

// Generate relevance explanation based on similarity score and content
function generateRelevanceExplanation(publication: DatabasePublication, similarityScore: number, query: string): string {
  const explanations = []
  
  // Score-based explanation
  if (similarityScore > 0.8) {
    explanations.push("Highly relevant - strong semantic match")
  } else if (similarityScore > 0.6) {
    explanations.push("Very relevant - good semantic match")
  } else if (similarityScore > 0.4) {
    explanations.push("Moderately relevant - some semantic overlap")
  } else {
    explanations.push("Potentially relevant - limited semantic match")
  }

  // Content-based explanation
  const queryLower = query.toLowerCase()
  const titleLower = publication.title.toLowerCase()
  const abstractLower = publication.abstract.toLowerCase()
  const keywordsLower = publication.keywords?.join(' ').toLowerCase() || ''

  if (titleLower.includes(queryLower)) {
    explanations.push("Query appears in title")
  }
  
  if (abstractLower.includes(queryLower)) {
    explanations.push("Query appears in abstract")
  }
  
  if (keywordsLower.includes(queryLower)) {
    explanations.push("Query matches keywords")
  }

  // Check for related terms
  const relatedTerms = {
    'space': ['microgravity', 'astronaut', 'mission', 'orbit', 'spacecraft'],
    'biology': ['biological', 'organism', 'cell', 'tissue', 'physiology'],
    'research': ['study', 'experiment', 'investigation', 'analysis'],
    'health': ['medical', 'health', 'disease', 'treatment', 'therapy']
  }

  for (const [term, related] of Object.entries(relatedTerms)) {
    if (queryLower.includes(term)) {
      const foundRelated = related.find(rel => 
        titleLower.includes(rel) || abstractLower.includes(rel) || keywordsLower.includes(rel)
      )
      if (foundRelated) {
        explanations.push(`Contains related term: ${foundRelated}`)
      }
    }
  }

  return explanations.join(' • ')
}

export async function POST(req: Request) {
  let client;
  
  try {
    const { query, limit = 10, threshold = 0.3 }: SearchRequest = await req.json()
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      )
    }

    console.log("[v0] Semantic search request:", { query: query.substring(0, 100) + "...", limit, threshold })
    
    // Generate embedding for the search query
    console.log("[v0] Generating query embedding...")
    const queryEmbedding = await generateQueryEmbedding(query)
    
    if (queryEmbedding.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate query embedding. Please check API keys." },
        { status: 500 }
      )
    }

    console.log("[v0] Query embedding generated, length:", queryEmbedding.length)
    
    // Get database connection
    console.log("[v0] Connecting to database...")
    client = await pool.connect()
    
    // Query all publications with embeddings
    const dbQuery = `
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
      WHERE embedding IS NOT NULL 
        AND array_length(embedding, 1) > 0
      ORDER BY publication_date DESC
    `
    
    const result = await client.query(dbQuery)
    const publications: DatabasePublication[] = result.rows
    
    console.log(`[v0] Fetched ${publications.length} publications with embeddings`)
    
    if (publications.length === 0) {
      return NextResponse.json({
        results: [],
        total: 0,
        query: query,
        message: "No publications with embeddings found in database"
      })
    }

    // Calculate similarity scores
    console.log("[v0] Calculating similarity scores...")
    const resultsWithSimilarity = publications
      .map(pub => ({
        ...pub,
        similarity_score: cosineSimilarity(queryEmbedding, pub.embedding)
      }))
      .filter(pub => pub.similarity_score >= threshold)
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, limit)

    console.log(`[v0] Found ${resultsWithSimilarity.length} results above threshold ${threshold}`)

    // Transform results for API response
    const searchResults: SearchResult[] = resultsWithSimilarity.map(pub => ({
      id: pub.id,
      title: pub.title,
      authors: Array.isArray(pub.authors) ? pub.authors : [pub.authors || "Unknown"],
      abstract: pub.abstract,
      publication_date: pub.publication_date,
      journal: pub.journal,
      doi: pub.doi,
      keywords: Array.isArray(pub.keywords) ? pub.keywords : [pub.keywords || ""],
      similarity_score: pub.similarity_score,
      relevance_explanation: generateRelevanceExplanation(pub, pub.similarity_score, query)
    }))

    console.log(`[v0] Semantic search completed with ${searchResults.length} results`)
    
    return NextResponse.json({
      results: searchResults,
      total: searchResults.length,
      query: query,
      threshold: threshold,
      message: `Found ${searchResults.length} semantically similar publications`
    })
    
  } catch (error) {
    console.error("[v0] Error in semantic search route:", error)
    return NextResponse.json(
      {
        error: "Failed to perform semantic search",
        results: [],
        total: 0
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
