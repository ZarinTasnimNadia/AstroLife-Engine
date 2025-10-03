"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Network, FileText, Github, Search, Bot } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

export default function LandingPage() {
  return (
    <div className="min-h-screen cosmic-bg">
      <div className="mars"></div>
      <div className="moon"></div>

      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-balance leading-tight gradient-text-hero">
            AstroLife Engine
          </h1>
          <p className="text-xl md:text-2xl text-primary font-medium">
            Unlocking Space Biology with NASA&apos;s Open Data
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Explore 600+ NASA space biology publications to support Moon and Mars exploration missions. Discover
            insights, connections, and knowledge gaps in space life sciences research.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6 cosmic-glow">
                Explore Publications
              </Button>
            </Link>
            <Link href="/search">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <Search className="w-5 h-5 mr-2" />
                Semantic Search
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors cosmic-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-foreground">Browse Publications</CardTitle>
              <CardDescription className="text-muted-foreground">
                Access and explore 600+ peer-reviewed publications from NASA&apos;s Space Biology program
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-colors cosmic-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/20 border border-accent flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-foreground">Semantic Search</CardTitle>
              <CardDescription className="text-muted-foreground">
                Find relevant research using AI-powered semantic search with vector embeddings
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-chart-2/50 transition-colors cosmic-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-chart-2/20 border border-chart-2 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-chart-2" />
              </div>
              <CardTitle className="text-foreground">AI Chat Assistant</CardTitle>
              <CardDescription className="text-muted-foreground">
                Ask complex questions and get intelligent answers with references to specific studies
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-chart-3/50 transition-colors cosmic-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-chart-3/20 border border-chart-3 flex items-center justify-center mb-4">
                <Network className="w-6 h-6 text-chart-3" />
              </div>
              <CardTitle className="text-foreground">Knowledge Graph</CardTitle>
              <CardDescription className="text-muted-foreground">
                Visualize connections between publications, authors, and research topics
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Powered by NASA Open Science Data</p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
