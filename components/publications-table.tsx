"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, ExternalLink, ChevronLeft, ChevronRight, Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface Publication {
  title: string
  link: string
  pmcid: string
  authors: string
  year: string
  abstract: string
  aiSummary?: string
  keywords: string
}

interface PublicationsTableProps {
  publications: Publication[]
  onViewEvidence: (publication: Publication) => void
  isSummaryLoading?: boolean
}

const keywordCategories = [
  {
    name: "Research Areas",
    keywords: ["Microgravity", "Radiation", "Isolation", "Space Medicine"],
  },
  {
    name: "Biological Systems",
    keywords: ["Plants", "Humans", "Animals", "Microbes", "Cells", "Genetics"],
  },
  {
    name: "Health Effects",
    keywords: ["Muscle Atrophy", "Bone Loss", "Immune System", "Cardiovascular", "Neurological"],
  },
  {
    name: "Mission Types",
    keywords: ["ISS", "Moon", "Mars", "Long-Duration"],
  },
]

export function PublicationsTable({ publications, onViewEvidence, isSummaryLoading = false }: PublicationsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const itemsPerPage = 10

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords((prev) => (prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword]))
    setCurrentPage(1)
  }

  const clearKeywords = () => {
    setSelectedKeywords([])
    setCurrentPage(1)
  }

  const filteredPublications = useMemo(() => {
    let filtered = publications

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (pub) =>
          pub.title.toLowerCase().includes(query) ||
          pub.pmcid.toLowerCase().includes(query) ||
          pub.authors.toLowerCase().includes(query) ||
          pub.year.includes(query) ||
          pub.abstract?.toLowerCase().includes(query) ||
          pub.keywords?.toLowerCase().includes(query),
      )
    }

    if (selectedKeywords.length > 0) {
      filtered = filtered.filter((pub) => {
        if (!pub.keywords) return false
        const pubKeywords = pub.keywords.toLowerCase()
        return selectedKeywords.some((keyword) => pubKeywords.includes(keyword.toLowerCase()))
      })
    }

    return filtered
  }, [publications, searchQuery, selectedKeywords])

  const totalPages = Math.ceil(filteredPublications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPublications = filteredPublications.slice(startIndex, endIndex)

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Search & Filter Publications</CardTitle>
          <CardDescription className="text-muted-foreground">
            Filter by title, author, year, keywords, or PMCID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search publications..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 bg-background/50"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium text-foreground">Filter by Keywords</h3>
              </div>
              {selectedKeywords.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearKeywords} className="h-7 px-2 text-xs">
                  <X className="w-3 h-3 mr-1" /> Clear filters
                </Button>
              )}
            </div>

            {selectedKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedKeywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="px-2 py-1 text-xs">
                    {keyword}
                    <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => toggleKeyword(keyword)} />
                  </Badge>
                ))}
              </div>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 border rounded-md p-2 bg-background/30">
              {keywordCategories.map((category) => (
                <div key={category.name} className="space-y-1">
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-primary transition-colors p-1 rounded"
                  >
                    <span>{category.name}</span>
                    {expandedCategories.includes(category.name) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {expandedCategories.includes(category.name) && (
                    <div className="grid grid-cols-2 gap-1 pl-2">
                      {category.keywords.map((keyword) => (
                        <div key={keyword} className="flex items-center space-x-2">
                          <Checkbox
                            id={`keyword-${keyword}`}
                            checked={selectedKeywords.includes(keyword)}
                            onCheckedChange={() => toggleKeyword(keyword)}
                          />
                          <label htmlFor={`keyword-${keyword}`} className="text-xs cursor-pointer">
                            {keyword}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredPublications.length} of {publications.length} publications
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-foreground font-semibold">Title</TableHead>
                  <TableHead className="text-foreground font-semibold">Authors</TableHead>
                  <TableHead className="text-foreground font-semibold">Year</TableHead>
                  <TableHead className="text-foreground font-semibold">Link</TableHead>
                  <TableHead className="text-foreground font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPublications.map((pub, index) => (
                  <TableRow key={index} className="border-border/50 hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground max-w-xl">
                      <span className="line-clamp-2">{pub.title}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs">
                      <span className="line-clamp-1">{pub.authors || "N/A"}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{pub.year || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {pub.pmcid && (
                        <a
                          href={pub.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 transition-colors font-mono text-sm inline-flex items-center gap-1"
                        >
                          {pub.pmcid}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => onViewEvidence(pub)}>
                        View Evidence
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
