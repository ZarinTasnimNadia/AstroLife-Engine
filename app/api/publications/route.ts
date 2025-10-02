import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const maxDuration = 60

interface Publication {
  title: string
  link: string
  pmcid: string
  authors: string
  year: string
  abstract: string
  keywords: string
}

async function fetchBatchPubMedData(
  pmcids: string[],
  onProgress?: (data: Map<string, any>) => void,
): Promise<Map<string, { authors: string; year: string; keywords: string; abstract: string }>> {
  const dataMap = new Map<string, { authors: string; year: string; keywords: string; abstract: string }>()

  if (pmcids.length === 0) return dataMap

  const chunkSize = 10 // Process more at once
  const chunks: string[][] = []

  for (let i = 0; i < pmcids.length; i += chunkSize) {
    chunks.push(pmcids.slice(i, i + chunkSize))
  }

  console.log(`[v0] Processing ${pmcids.length} PMCIDs in ${chunks.length} chunks`)

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex]
    let retryCount = 0
    const maxRetries = 2 // Reduced retries for faster failure
    let success = false

    while (!success && retryCount <= maxRetries) {
      try {
        const ids = chunk.map((id) => id.replace("PMC", "")).join(",")

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000)

        const response = await fetch(
          `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pmc&id=${ids}&retmode=json`,
          {
            headers: {
              "User-Agent": "AstroLifeEngine/1.0 (research tool)",
            },
            signal: controller.signal,
          },
        )

        clearTimeout(timeoutId)

        if (response.status === 429) {
          retryCount++
          if (retryCount <= maxRetries) {
            const backoffDelay = 1500 * Math.pow(2, retryCount - 1)
            console.log(`[v0] Rate limit hit, retrying in ${backoffDelay}ms`)
            await new Promise((resolve) => setTimeout(resolve, backoffDelay))
            continue
          } else {
            chunk.forEach((pmcid) => {
              dataMap.set(pmcid, {
                authors: "Authors unavailable",
                year: "N/A",
                keywords: "",
                abstract: "Abstract temporarily unavailable.",
              })
            })
            break
          }
        }

        if (!response.ok) {
          chunk.forEach((pmcid) => {
            dataMap.set(pmcid, {
              authors: "Authors unavailable",
              year: "N/A",
              keywords: "",
              abstract: "Abstract not available.",
            })
          })
          break
        }

        const data = await response.json()

        if (data.result) {
          chunk.forEach((pmcid) => {
            const numericId = pmcid.replace("PMC", "")
            const article = data.result[numericId]

            if (article) {
              const authorList = article.authors?.slice(0, 3).map((a: any) => a.name) || []
              const authors = authorList.join(", ")
              const authorsDisplay = article.authors?.length > 3 ? `${authors}, et al.` : authors
              const year = article.pubdate ? article.pubdate.match(/\d{4}/)?.[0] || "N/A" : "N/A"

              const title = article.title || ""
              const keywords = extractKeywords(title)

              let abstract = "Abstract not available for this publication."
              if (article.abstract) {
                abstract = article.abstract
              } else if (article.snippet) {
                abstract = article.snippet
              }

              dataMap.set(pmcid, {
                authors: authorsDisplay || "Authors unavailable",
                year,
                keywords,
                abstract,
              })
            } else {
              dataMap.set(pmcid, {
                authors: "Authors unavailable",
                year: "N/A",
                keywords: "",
                abstract: "Abstract not available for this publication.",
              })
            }
          })
        }

        success = true
      } catch (error) {
        console.error(`[v0] Error fetching chunk ${chunkIndex + 1}:`, error)
        chunk.forEach((pmcid) => {
          dataMap.set(pmcid, {
            authors: "Authors unavailable",
            year: "N/A",
            keywords: "",
            abstract: "Abstract temporarily unavailable.",
          })
        })
        break
      }
    }

    if (chunkIndex < chunks.length - 1) {
      const delay = chunkIndex < 10 ? 400 : 600
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  return dataMap
}

function extractKeywords(title: string): string {
  const titleLower = title.toLowerCase()
  const keywords: string[] = []

  const keywordMap: { [key: string]: string[] } = {
    Microgravity: ["microgravity", "weightless", "zero gravity", "0-g"],
    Radiation: ["radiation", "cosmic ray", "solar particle"],
    Isolation: ["isolation", "confined", "confinement"],
    "Space Medicine": ["space medicine", "astronaut health", "spaceflight"],
    Plants: ["plant", "vegetation", "crop", "photosynthesis"],
    Humans: ["human", "astronaut", "crew"],
    Animals: ["animal", "mouse", "mice", "rat", "rodent"],
    Microbes: ["microbe", "bacteria", "microbial", "pathogen"],
    Cells: ["cell", "cellular"],
    Genetics: ["gene", "genetic", "dna", "rna", "genome"],
    "Muscle Atrophy": ["muscle", "atrophy", "skeletal"],
    "Bone Loss": ["bone", "osteo", "skeletal"],
    "Immune System": ["immune", "immunity", "immunological"],
    Cardiovascular: ["cardiovascular", "cardiac", "heart"],
    Neurological: ["neuro", "brain", "cognitive"],
    ISS: ["iss", "international space station", "space station"],
    Moon: ["moon", "lunar"],
    Mars: ["mars", "martian"],
    "Long-Duration": ["long-duration", "long duration", "extended mission"],
  }

  for (const [keyword, patterns] of Object.entries(keywordMap)) {
    if (patterns.some((pattern) => titleLower.includes(pattern))) {
      keywords.push(keyword)
    }
  }

  return keywords.join(", ")
}

export async function GET() {
  try {
    console.log("[v0] Starting publications fetch")

    const response = await fetch(
      "https://raw.githubusercontent.com/jgalazka/SB_publications/main/SB_publication_PMC.csv",
    )

    if (!response.ok) {
      console.error("[v0] Failed to fetch CSV:", response.status)
      return NextResponse.json(
        {
          error: "Failed to fetch CSV data",
          publications: [],
        },
        { status: 500 },
      )
    }

    const csvText = await response.text()
    const lines = csvText.split("\n")

    const publicationsData: Array<{ title: string; link: string; pmcid: string }> = []

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      const values: string[] = []
      let currentValue = ""
      let insideQuotes = false

      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j]

        if (char === '"') {
          insideQuotes = !insideQuotes
        } else if (char === "," && !insideQuotes) {
          values.push(currentValue.trim())
          currentValue = ""
        } else {
          currentValue += char
        }
      }
      values.push(currentValue.trim())

      const title = values[0] || ""
      const link = values[1] || ""

      const pmcidMatch = link.match(/PMC(\d+)/)
      const pmcid = pmcidMatch ? `PMC${pmcidMatch[1]}` : ""

      publicationsData.push({ title, link, pmcid })
    }

    console.log(`[v0] Parsed ${publicationsData.length} publications from CSV`)

    const pmcids = publicationsData.filter((p) => p.pmcid).map((p) => p.pmcid)

    const dataMap = await fetchBatchPubMedData(pmcids)

    const publications: Publication[] = publicationsData.map((pub) => {
      const data = dataMap.get(pub.pmcid) || {
        authors: "Authors unavailable",
        year: "N/A",
        keywords: "",
        abstract: "Abstract not available for this publication.",
      }

      return {
        ...pub,
        authors: data.authors,
        year: data.year,
        abstract: data.abstract,
        keywords: data.keywords,
      }
    })

    console.log(`[v0] Returning ${publications.length} publications`)
    return NextResponse.json({ publications })
  } catch (error) {
    console.error("[v0] Error in publications route:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch publications",
        publications: [],
      },
      { status: 500 },
    )
  }
}
