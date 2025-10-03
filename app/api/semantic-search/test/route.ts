import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test the semantic search API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/semantic-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: "microgravity effects on plant growth",
        limit: 5,
        threshold: 0.3
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: "Semantic search API is working",
      testResults: {
        query: "microgravity effects on plant growth",
        resultsCount: data.results?.length || 0,
        total: data.total || 0,
        threshold: data.threshold || 0.3
      }
    })
  } catch (error) {
    console.error('Error testing semantic search:', error)
    return NextResponse.json(
      {
        success: false,
        error: "Semantic search test failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
