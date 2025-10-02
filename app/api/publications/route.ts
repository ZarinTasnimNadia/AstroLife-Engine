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

interface Publication {
  title: string
  link: string
  pmcid: string
  authors: string
  year: string
  abstract: string
  keywords: string
}

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

// Helper function to extract PMC ID from DOI
function extractPMCID(doi: string): string {
  // Try to extract PMC ID from DOI patterns
  const pmcMatch = doi.match(/PMC(\d+)/i)
  if (pmcMatch) {
    return `PMC${pmcMatch[1]}`
  }
  
  // If no PMC ID found, return empty string
  return ""
}

// Helper function to create a link from DOI
function createLink(doi: string): string {
  if (doi.startsWith('http')) {
    return doi
  }
  return `https://doi.org/${doi}`
}

export async function GET() {
  let client;
  
  try {
    console.log("[v0] Starting publications fetch from database")
    
    // Get database connection
    client = await pool.connect()
    
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
        created_at,
        updated_at
      FROM publications 
      ORDER BY publication_date DESC
    `
    
    const result = await client.query(query)
    const dbPublications: DatabasePublication[] = result.rows
    
    console.log(`[v0] Fetched ${dbPublications.length} publications from database`)
    
    // Transform database publications to API format
    const publications: Publication[] = dbPublications.map((dbPub) => {
      const pmcid = extractPMCID(dbPub.doi)
      const link = createLink(dbPub.doi)
      
      // Format authors array to string
      const authorsString = Array.isArray(dbPub.authors) 
        ? dbPub.authors.join(", ")
        : dbPub.authors || "Authors unavailable"
      
      // Format keywords array to string
      const keywordsString = Array.isArray(dbPub.keywords)
        ? dbPub.keywords.join(", ")
        : dbPub.keywords || ""
      
      // Extract year from publication date
      const year = dbPub.publication_date 
        ? new Date(dbPub.publication_date).getFullYear().toString()
        : "N/A"
      
      return {
        title: dbPub.title || "",
        link: link,
        pmcid: pmcid,
        authors: authorsString,
        year: year,
        abstract: dbPub.abstract || "Abstract not available for this publication.",
        keywords: keywordsString,
      }
    })
    
    console.log(`[v0] Returning ${publications.length} publications`)
    return NextResponse.json({ publications })
    
  } catch (error) {
    console.error("[v0] Error in publications route:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch publications from database",
        publications: [],
      },
      { status: 500 },
    )
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release()
    }
  }
}
