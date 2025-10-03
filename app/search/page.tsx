"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Sparkles, Filter, BarChart3 } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { EvidenceModal } from "@/components/evidence-modal"

interface SemanticSearchResult {
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

interface SearchFilters {
  threshold: number
  limit: number
  sortBy: 'relevance' | 'date' | 'title'
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SemanticSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedPublication, setSelectedPublication] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    threshold: 0.3,
    limit: 20,
    sortBy: 'relevance'
  })

  const handleSearch = async () => {
    if (!query.trim()) return

    try {
      setLoading(true)
      setShowResults(false)
      
      const response = await fetch('/api/semantic-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          limit: filters.limit,
          threshold: filters.threshold
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      let searchResults = data.results || []

      // Apply sorting
      if (filters.sortBy === 'date') {
        searchResults.sort((a: SemanticSearchResult, b: SemanticSearchResult) => 
          new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime()
        )
      } else if (filters.sortBy === 'title') {
        searchResults.sort((a: SemanticSearchResult, b: SemanticSearchResult) => 
          a.title.localeCompare(b.title)
        )
      }
      // 'relevance' is already sorted by similarity_score from the API

      setResults(searchResults)
      setShowResults(true)
    } catch (error) {
      console.error('Error performing semantic search:', error)
      setResults([])
      setShowResults(true)
    } finally {
      setLoading(false)
    }
  }

  const handleViewEvidence = (result: SemanticSearchResult) => {
    setSelectedPublication({
      title: result.title,
      authors: Array.isArray(result.authors) ? result.authors.join(", ") : result.authors,
      year: new Date(result.publication_date).getFullYear().toString(),
      keywords: Array.isArray(result.keywords) ? result.keywords.join(", ") : result.keywords,
      doi: result.doi,
      pmcid: "",
      abstract: result.abstract,
      link: `https://doi.org/${result.doi}`
    })
    setModalOpen(true)
  }

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return "bg-green-500"
    if (score >= 0.6) return "bg-yellow-500"
    if (score >= 0.4) return "bg-orange-500"
    return "bg-red-500"
  }

  const getSimilarityLabel = (score: number) => {
    if (score >= 0.8) return "Excellent Match"
    if (score >= 0.6) return "Good Match"
    if (score >= 0.4) return "Fair Match"
    return "Weak Match"
  }

  return (
    <div className="min-h-screen cosmic-bg">
      <div className="mars"></div>
      <div className="moon"></div>

      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
            Semantic Search
          </h1>
          <p className="text-lg text-muted-foreground">
            Find relevant space biology research using AI-powered semantic search
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search Interface */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 cosmic-shadow">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Search Query
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Ask questions about space biology research in natural language
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., How does microgravity affect plant root growth?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-background/50"
                  disabled={loading}
                />
                <Button onClick={handleSearch} disabled={loading || !query.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Search Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/30">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Similarity Threshold
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.1"
                      value={filters.threshold}
                      onChange={(e) => setFilters({...filters, threshold: parseFloat(e.target.value)})}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-12">
                      {Math.round(filters.threshold * 100)}%
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Max Results
                  </label>
                  <select
                    value={filters.limit}
                    onChange={(e) => setFilters({...filters, limit: parseInt(e.target.value)})}
                    className="w-full p-2 rounded-md bg-background/50 border border-border/30 text-foreground"
                  >
                    <option value={10}>10 results</option>
                    <option value={20}>20 results</option>
                    <option value={50}>50 results</option>
                    <option value={100}>100 results</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
                    className="w-full p-2 rounded-md bg-background/50 border border-border/30 text-foreground"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Publication Date</option>
                    <option value="title">Title</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {showResults && (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 cosmic-shadow">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Search Results
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {results.length > 0 
                    ? `Found ${results.length} publications matching your query`
                    : "No publications found matching your criteria"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {results.length > 0 ? (
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <Card key={result.id || index} className="bg-background/30 border-border/30">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-base text-foreground mb-2">
                                {result.title}
                              </CardTitle>
                              <CardDescription className="text-sm text-muted-foreground mb-2">
                                {Array.isArray(result.authors) ? result.authors.join(", ") : result.authors} • {new Date(result.publication_date).getFullYear()}
                              </CardDescription>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {Array.isArray(result.keywords) && result.keywords.slice(0, 5).map((keyword, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`w-3 h-3 rounded-full ${getSimilarityColor(result.similarity_score)}`}></div>
                                <span className="text-sm font-medium text-primary">
                                  {Math.round(result.similarity_score * 100)}%
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {getSimilarityLabel(result.similarity_score)}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {result.journal}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {result.abstract}
                          </p>
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-muted-foreground">
                              {result.relevance_explanation}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleViewEvidence(result)}
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No results found</p>
                    <p className="text-sm">Try adjusting your search query or lowering the similarity threshold</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Evidence Modal */}
      <EvidenceModal publication={selectedPublication} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
