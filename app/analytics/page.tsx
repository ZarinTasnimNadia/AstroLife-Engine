"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp, AlertCircle, Lightbulb } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Line, LineChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Navigation } from "@/components/navigation"

interface Publication {
  title: string
  authors: string
  year: string
  keywords: string | string[]
  doi: string
  pmcid: string
}

export default function AnalyticsPage() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [timelineData, setTimelineData] = useState<any[]>([])
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [topicsData, setTopicsData] = useState<any[]>([])

  useEffect(() => {
    async function fetchPublications() {
      try {
        const response = await fetch("/api/publications")
        const data = await response.json()
        const pubs = data.publications || []
        console.log("[Analytics] Fetched publications:", pubs.length)
        console.log("[Analytics] First publication sample:", pubs[0])
        setPublications(pubs)

        // Process timeline data
        const yearCounts: Record<string, number> = {}
        pubs.forEach((pub: Publication) => {
          const year = pub.year
          if (year) {
            yearCounts[year] = (yearCounts[year] || 0) + 1
          }
        })

        const timeline = Object.entries(yearCounts)
          .map(([year, count]) => ({ year, publications: count }))
          .sort((a, b) => a.year.localeCompare(b.year))
          .slice(-15)

        setTimelineData(timeline)

        // Process heatmap data (keyword frequency by year)
        const keywordYearMap: Record<string, Record<string, number>> = {}
        let pubsWithKeywords = 0
        
        pubs.forEach((pub: Publication) => {
          if (pub.year) {
            // Handle both string and array formats for keywords
            let keywords: string[] = []
            
            if (pub.keywords) {
              pubsWithKeywords++
              
              if (typeof pub.keywords === 'string') {
                // If it's a string, split by comma or semicolon
                keywords = pub.keywords
                  .split(/[,;]/)
                  .map((k) => k.trim())
                  .filter((k) => k.length > 0)
              } else if (Array.isArray(pub.keywords)) {
                // If it's already an array, use it directly
                keywords = pub.keywords.map((k) => String(k).trim()).filter((k) => k.length > 0)
              }
            }
            
            // If no keywords, extract from title
            if (keywords.length === 0 && pub.title) {
              const titleLower = pub.title.toLowerCase()
              const commonTopics = ["microgravity", "radiation", "plant", "cell", "bone", "muscle", "immune", "space", "mars", "moon"]
              commonTopics.forEach(topic => {
                if (titleLower.includes(topic)) {
                  keywords.push(topic.charAt(0).toUpperCase() + topic.slice(1))
                }
              })
            }
            
            // Take top 5 keywords per publication
            keywords.slice(0, 5).forEach((keyword) => {
              if (keyword && keyword.length > 2) {
                // Normalize keyword
                const normalizedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase()
                
                if (!keywordYearMap[normalizedKeyword]) {
                  keywordYearMap[normalizedKeyword] = {}
                }
                keywordYearMap[normalizedKeyword][pub.year] = (keywordYearMap[normalizedKeyword][pub.year] || 0) + 1
              }
            })
          }
        })

        console.log("[Analytics] Publications with keywords:", pubsWithKeywords, "/", pubs.length)
        console.log("[Analytics] Keyword year map:", keywordYearMap)
        console.log("[Analytics] Unique keywords found:", Object.keys(keywordYearMap).length)

        // Get top keywords
        const topKeywords = Object.entries(keywordYearMap)
          .map(([keyword, years]) => ({
            keyword,
            total: Object.values(years).reduce((a, b) => a + b, 0),
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 8)

        console.log("[Analytics] Top keywords:", topKeywords)

        const recentYears = timeline.slice(-5).map((d) => d.year)
        const heatmap = topKeywords.map(({ keyword }) => {
          const row: any = { keyword }
          recentYears.forEach((year) => {
            row[year] = keywordYearMap[keyword]?.[year] || 0
          })
          return row
        })

        console.log("[Analytics] Heatmap data:", heatmap)
        setHeatmapData(heatmap)

        const topicYearMap: Record<string, Record<string, number>> = {}
        const topicCategories = ["microgravity", "radiation", "plant", "cell", "bone", "muscle"]

        pubs.forEach((pub: Publication) => {
          if (pub.year) {
            // Check both keywords and title for topic matching
            const searchText = `${pub.keywords || ""} ${pub.title || ""}`.toLowerCase()
            
            topicCategories.forEach((topic) => {
              // More flexible matching
              let matched = false
              if (topic === "microgravity" && (searchText.includes("microgravity") || searchText.includes("micro-gravity") || searchText.includes("weightless") || searchText.includes("zero gravity"))) {
                matched = true
              } else if (topic === "radiation" && (searchText.includes("radiation") || searchText.includes("cosmic ray") || searchText.includes("solar"))) {
                matched = true
              } else if (topic === "plant" && (searchText.includes("plant") || searchText.includes("vegetation") || searchText.includes("crop"))) {
                matched = true
              } else if (topic === "cell" && (searchText.includes("cell") || searchText.includes("cellular"))) {
                matched = true
              } else if (topic === "bone" && (searchText.includes("bone") || searchText.includes("skeletal") || searchText.includes("osteo"))) {
                matched = true
              } else if (topic === "muscle" && (searchText.includes("muscle") || searchText.includes("muscular") || searchText.includes("atrophy"))) {
                matched = true
              }
              
              if (matched) {
                if (!topicYearMap[topic]) {
                  topicYearMap[topic] = {}
                }
                topicYearMap[topic][pub.year] = (topicYearMap[topic][pub.year] || 0) + 1
              }
            })
          }
        })

        console.log("[Analytics] Topic year map:", topicYearMap)

        const recentYearsTopics = timeline.slice(-10).map((d) => d.year)
        const topicsTimeline = recentYearsTopics.map((year) => {
          const dataPoint: any = { year }
          topicCategories.forEach((topic) => {
            dataPoint[topic] = topicYearMap[topic]?.[year] || 0
          })
          return dataPoint
        })
        
        console.log("[Analytics] Topics timeline data:", topicsTimeline)
        setTopicsData(topicsTimeline)
      } catch (error) {
        console.error("Error fetching publications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPublications()
  }, [])

  const knowledgeGaps = [
    "Long-term effects of deep space radiation on human cellular repair mechanisms",
    "Microbial ecosystem dynamics in closed-loop life support systems for Mars missions",
    "Plant growth optimization in lunar regolith with limited water resources",
    "Psychological and neurological impacts of extended isolation during interplanetary travel",
    "Bone density preservation strategies for multi-year missions beyond low Earth orbit",
    "Reproductive biology and development in reduced gravity environments",
  ]

  return (
    <div className="min-h-screen cosmic-bg">
      <div className="mars"></div>
      <div className="moon"></div>

      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
            Progress & Gaps in NASA Space Biology
          </h1>
          <p className="text-lg text-muted-foreground">
            Analyze research trends and identify knowledge gaps in space life sciences
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Analyzing data...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Timeline Chart */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 cosmic-shadow">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Publications Timeline
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Number of publications per year (last 15 years)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      publications: {
                        label: "Publications",
                        color: "hsl(var(--primary))",
                      },
                    }}
                    className="h-[350px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.04 270)" />
                        <XAxis dataKey="year" stroke="oklch(0.65 0.02 265)" />
                        <YAxis stroke="oklch(0.65 0.02 265)" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar
                          dataKey="publications"
                          stroke="oklch(0.65 0.02 265)"
                          fill="oklch(0.705 0.228 328.1)"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50 cosmic-shadow">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-accent" />
                    Research Topics Over Time
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Trending research areas (last 10 years)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {topicsData.length === 0 ? (
                    <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                      <p>No topic data available. Loading publications...</p>
                    </div>
                  ) : (
                    <ChartContainer
                      config={{
                        microgravity: { label: "Microgravity", color: "oklch(0.705 0.228 328.1)" },
                        radiation: { label: "Radiation", color: "oklch(0.75 0.2 150)" },
                        plant: { label: "Plant", color: "oklch(0.7 0.22 90)" },
                        cell: { label: "Cell", color: "oklch(0.72 0.24 200)" },
                        bone: { label: "Bone", color: "oklch(0.68 0.26 30)" },
                        muscle: { label: "Muscle", color: "oklch(0.73 0.21 270)" },
                      }}
                      className="h-[350px] w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={topicsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.04 270)" />
                          <XAxis dataKey="year" stroke="oklch(0.65 0.02 265)" />
                          <YAxis stroke="oklch(0.65 0.02 265)" allowDecimals={false} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="microgravity"
                            stroke="oklch(0.705 0.228 328.1)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="radiation" 
                            stroke="oklch(0.75 0.2 150)" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="plant" 
                            stroke="oklch(0.7 0.22 90)" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="cell" 
                            stroke="oklch(0.72 0.24 200)" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="bone" 
                            stroke="oklch(0.68 0.26 30)" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="muscle" 
                            stroke="oklch(0.73 0.21 270)" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Heatmap */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 cosmic-shadow">
              <CardHeader>
                <CardTitle className="text-foreground">Keyword Frequency Heatmap</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Top research keywords by year (recent 5 years)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {heatmapData.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    <p>No keyword data available. Loading publications...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Keyword</th>
                          {timelineData.slice(-5).map((d) => (
                            <th key={d.year} className="text-center py-3 px-4 text-sm font-semibold text-foreground">
                              {d.year}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {heatmapData.map((row, index) => (
                          <tr key={index} className="border-b border-border/30">
                            <td className="py-3 px-4 text-sm text-muted-foreground font-medium">{row.keyword}</td>
                            {timelineData.slice(-5).map((d) => {
                              const value = row[d.year] || 0
                              const intensity = Math.min(value / 5, 1)
                              return (
                                <td key={d.year} className="text-center py-3 px-4">
                                  <div
                                    className="inline-flex items-center justify-center w-12 h-8 rounded text-xs font-medium transition-all hover:scale-110"
                                    style={{
                                      backgroundColor: `oklch(${0.65 - intensity * 0.3} ${0.25 * intensity} 285)`,
                                      color: intensity > 0.5 ? "oklch(0.98 0.01 265)" : "oklch(0.65 0.02 265)",
                                    }}
                                    title={`${row.keyword} in ${d.year}: ${value} publications`}
                                  >
                                    {value > 0 ? value : "-"}
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-primary/10 backdrop-blur-sm border-accent/30 cosmic-shadow">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2 text-2xl">
                  <AlertCircle className="w-6 h-6 text-accent" />
                  Potential Knowledge Gaps
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Critical areas requiring further research for Moon and Mars exploration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {knowledgeGaps.map((gap, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg bg-card/50 border border-border/50 hover:border-accent/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 border border-accent flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-accent">{index + 1}</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed pt-1">{gap}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
