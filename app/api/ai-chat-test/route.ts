import { NextResponse } from "next/server"
import { Pool } from "pg"

export const dynamic = "force-dynamic"

// Database connection pool
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_UAJfycaGi0k8@ep-withered-mud-a1we345i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
})

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: {
      groqApiKeySet: !!process.env.GROQ_API_KEY,
      groqApiKeyLength: process.env.GROQ_API_KEY?.length || 0,
      nodeEnv: process.env.NODE_ENV
    },
    tests: {
      database: { status: "pending", message: "" },
      groq: { status: "pending", message: "" }
    }
  }

  // Test database connection
  let client
  try {
    client = await pool.connect()
    const result = await client.query('SELECT COUNT(*) as count FROM publications')
    diagnostics.tests.database = {
      status: "success",
      message: `Connected! Found ${result.rows[0].count} publications in database`,
      publicationCount: result.rows[0].count
    }
  } catch (error) {
    diagnostics.tests.database = {
      status: "failed",
      message: error instanceof Error ? error.message : "Unknown database error"
    }
  } finally {
    if (client) {
      client.release()
    }
  }

  // Test Groq API key
  if (!process.env.GROQ_API_KEY) {
    diagnostics.tests.groq = {
      status: "failed",
      message: "GROQ_API_KEY environment variable is not set. Get one from https://console.groq.com/keys"
    }
  } else if (process.env.GROQ_API_KEY.length < 20) {
    diagnostics.tests.groq = {
      status: "warning",
      message: "GROQ_API_KEY is set but seems too short. Make sure it's valid."
    }
  } else {
    diagnostics.tests.groq = {
      status: "success",
      message: "GROQ_API_KEY is set and looks valid (but not tested against API)"
    }
  }

  // Overall status
  const allPassed = Object.values(diagnostics.tests).every((test: any) => test.status === "success")
  diagnostics.overall = allPassed ? "All systems go! 🚀" : "Some issues detected ⚠️"

  return NextResponse.json(diagnostics, { status: allPassed ? 200 : 500 })
}
