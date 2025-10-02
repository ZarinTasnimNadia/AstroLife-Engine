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
  keywords: string
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
        pubs.forEach((pub: Publication) => {
          if (pub.keywords && pub.year) {
            const keywords = pub.keywords
              .split(/[,;]/)
              .map((k) => k.trim())
              .slice(0, 3)
            keywords.forEach((keyword) => {
              if (!keywordYearMap[keyword]) {
                keywordYearMap[keyword] = {}
              }
              keywordYearMap[keyword][pub.year] = (keywordYearMap[keyword][pub.year] || 0) + 1
            })
          }
        })

        // Get top keywords
        const topKeywords = Object.entries(keywordYearMap)
          .map(([keyword, years]) => ({
            keyword,
            total: Object.values(years).reduce((a, b) => a + b, 0),
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 8)

        const recentYears = timeline.slice(-5).map((d) => d.year)
        const heatmap = topKeywords.map(({ keyword }) => {
          const row: any = { keyword }
          recentYears.forEach((year) => {
            row[year] = keywordYearMap[keyword]?.[year] || 0
          })
          return row
        })

        setHeatmapData(heatmap)

        const topicYearMap: Record<string, Record<string, number>> = {}
        const topicCategories = ["microgravity", "radiation", "plant", "cell", "bone", "muscle"]

        pubs.forEach((pub: Publication) => {
          if (pub.keywords && pub.year) {
            const keywords = pub.keywords.toLowerCase()
            topicCategories.forEach((topic) => {
              if (keywords.includes(topic)) {
                if (!topicYearMap[topic]) {
                  topicYearMap[topic] = {}
                }
                topicYearMap[topic][pub.year] = (topicYearMap[topic][pub.year] || 0) + 1
              }
            })
          }
        })

        const recentYearsTopics = timeline.slice(-10).map((d) => d.year)
        const topicsTimeline = recentYearsTopics.map((year) => {
          const dataPoint: any = { year }
          topicCategories.forEach((topic) => {
            dataPoint[topic] = topicYearMap[topic]?.[year] || 0
          })
          return dataPoint
        })
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
                        <YAxis stroke="oklch(0.65 0.02 265)" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="microgravity"
                          stroke="oklch(0.705 0.228 328.1)"
                          strokeWidth={2}
                        />
                        <Line type="monotone" dataKey="radiation" stroke="oklch(0.75 0.2 150)" strokeWidth={2} />
                        <Line type="monotone" dataKey="plant" stroke="oklch(0.7 0.22 90)" strokeWidth={2} />
                        <Line type="monotone" dataKey="cell" stroke="oklch(0.72 0.24 200)" strokeWidth={2} />
                        <Line type="monotone" dataKey="bone" stroke="oklch(0.68 0.26 30)" strokeWidth={2} />
                        <Line type="monotone" dataKey="muscle" stroke="oklch(0.73 0.21 270)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
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
                                  className="inline-flex items-center justify-center w-12 h-8 rounded text-xs font-medium"
                                  style={{
                                    backgroundColor: `oklch(${0.65 - intensity * 0.3} ${0.25 * intensity} 285)`,
                                    color: intensity > 0.5 ? "oklch(0.98 0.01 265)" : "oklch(0.65 0.02 265)",
                                  }}
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
