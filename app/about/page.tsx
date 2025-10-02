"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Github, Rocket, Database, BookOpen, FileText } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function AboutPage() {
  const dataSources = [
    {
      name: "Space Biology Publications CSV",
      description: "Comprehensive dataset of 600+ peer-reviewed publications from NASA's Space Biology program",
      url: "https://github.com/jgalazka/SB_publications",
      icon: FileText,
    },
    {
      name: "NASA Open Science Data Repository (OSDR)",
      description: "Central archive for space biology and physical sciences data from spaceflight experiments",
      url: "https://osdr.nasa.gov/bio/",
      icon: Database,
    },
    {
      name: "NASA Space Life Sciences Library",
      description: "Digital library of space life sciences research and technical documents",
      url: "https://lsda.jsc.nasa.gov/",
      icon: BookOpen,
    },
    {
      name: "NASA Task Book",
      description: "Database of current and past NASA-funded research projects in space biology",
      url: "https://taskbook.nasaprs.com/",
      icon: Rocket,
    },
  ]

  const teamMembers = [
    {
      name: "Dr. Sarah Chen",
      role: "Principal Investigator",
      bio: "Space biologist specializing in microgravity effects on cellular systems",
    },
    {
      name: "Dr. Marcus Rodriguez",
      role: "Data Scientist",
      bio: "Expert in knowledge graph construction and semantic analysis",
    },
    {
      name: "Dr. Emily Nakamura",
      role: "Software Engineer",
      bio: "Full-stack developer focused on scientific data visualization",
    },
  ]

  return (
    <div className="min-h-screen cosmic-bg">
      <div className="mars"></div>
      <div className="moon"></div>

      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-12">
          {/* Mission Section */}
          <section className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary mb-4">
              <Rocket className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold text-foreground">About AstroLife Engine</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              AstroLife Engine is a knowledge platform that synthesizes and analyzes over 600 NASA space biology
              publications to support future Moon and Mars exploration missions.
            </p>
          </section>

          {/* Mission Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 cosmic-shadow">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Space biology research is critical for enabling long-duration human spaceflight missions. Understanding
                how biological systems respond to microgravity, radiation, and isolation is essential for keeping
                astronauts healthy during missions to the Moon, Mars, and beyond.
              </p>
              <p>
                AstroLife Engine aggregates decades of NASA-funded research into an accessible, searchable platform. By
                connecting publications through knowledge graphs and providing AI-powered summaries, we help researchers
                and mission planners quickly identify relevant findings and knowledge gaps.
              </p>
              <p>
                Our goal is to accelerate discovery by making space biology research more discoverable, connected, and
                actionable for the next generation of space exploration.
              </p>
            </CardContent>
          </Card>

          {/* Data Sources Section */}
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">NASA Data Sources</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {dataSources.map((source, index) => (
                <Card
                  key={index}
                  className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors cosmic-shadow"
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary flex items-center justify-center mb-3">
                      <source.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-foreground">{source.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">{source.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Source
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Team Section */}
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Our Team</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 text-center cosmic-shadow">
                  <CardHeader>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-primary mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-foreground">{member.name.charAt(4)}</span>
                    </div>
                    <CardTitle className="text-foreground">{member.name}</CardTitle>
                    <CardDescription className="text-primary font-medium">{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Footer Section */}
          <Card className="bg-primary/5 border-primary/20 cosmic-shadow">
            <CardContent className="py-8 text-center space-y-4">
              <p className="text-lg text-foreground font-medium">Powered by NASA Open Science Data</p>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                This project is built on publicly available NASA data and is committed to open science principles. All
                data sources are freely accessible to researchers worldwide.
              </p>
              <Button variant="outline" className="bg-transparent" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  View Project on GitHub
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
