"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Github, Rocket, Database, FileText } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function AboutPage() {
  const dataSources = [
    {
      name: "Space Biology Publications",
      description: "A list of 608 full-text open-access Space Biology publications",
      url: "https://github.com/jgalazka/SB_publications/tree/main",
      icon: FileText,
    },
    {
      name: "NASA Biological & Physical Sciences Data",
      description: "A list of 608 full-text open-access Space Biology publications",
      url: "https://science.nasa.gov/biological-physical/data/",
      icon: Database,
    },
  ]

  const teamMembers = [
    {
      name: "Ryan Ahmed",
      role: "Team Leader & Strategic Consultant",
      bio: "Provides strategic leadership and expert guidance to drive the project vision forward.",
    },
    {
      name: "Nusayba Mahfuza Zaman",
      role: "Frontend Developer & Knowledge Graph Specialist",
      bio: "Specializes in creating interactive knowledge graphs and frontend visualizations.",
    },
    {
      name: "Raiyan Rahman",
      role: "Backend Developer & Database Logic Architect",
      bio: "Architects and implements backend systems and database infrastructure.",
    },
    {
      name: "Zarin Tasnim",
      role: "Full-Stack Developer & Project Manager",
      bio: "Manages full-stack development and coordinates project workflows.",
    },
    {
      name: "Al Saihan",
      role: "Documentation & Resource Coordinator",
      bio: "Organizes documentation and manages project resources and knowledge base.",
    },
  ]

  return (
    <div className="min-h-screen cosmic-bg">
      <div className="mars"></div>
      <div className="moon"></div>

      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl flex flex-col items-center">
        <div className="space-y-12 w-full">
          {/* About Section */}
          <section className="text-center space-y-6 flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary mb-4">
              <Rocket className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold text-foreground">About AstroLife Engine</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              AstroLife Engine is a dynamic web application designed to simplify decades of NASA's bioscience research
              for the future of human space exploration. By leveraging NASA's open dataset of more than 600 space
              biology publications.
            </p>
          </section>

          {/* Executive Summary */}
          <div className="flex justify-center w-full">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 cosmic-shadow max-w-4xl w-full">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-foreground">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground leading-relaxed text-center">
                <p>
                  NASA's decades of space biology research have produced critical insights into how humans, plants, and
                  living systems adapt to the challenges of space. Yet this knowledge, while publicly available, is
                  dispersed across hundreds of publications and databases, making it difficult for researchers, mission
                  planners, and policymakers to access and apply effectively.
                </p>
                <p>
                  AstroLife Engine transforms these hundreds of publications into an accessible, AI-powered dashboard,
                  enabling researchers, mission planners, and policymakers to quickly uncover insights, identify gaps,
                  and support safer missions to the Moon, Mars, and beyond.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Data Sources Section */}
          <section className="w-full">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">NASA Data Sources</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {dataSources.map((source, index) => (
                <Card
                  key={index}
                  className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors cosmic-shadow"
                >
                  <CardHeader className="text-center flex flex-col items-center">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary flex items-center justify-center mb-3">
                      <source.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-foreground">{source.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">{source.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <Button variant="outline" className="w-full justify-center bg-transparent" asChild>
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
          <section className="w-full">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Our Team</h2>
            <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
              {teamMembers.map((member, index) => (
                <Card
                  key={index}
                  className="bg-card/50 backdrop-blur-sm border-border/50 text-center cosmic-shadow w-full md:w-[calc(33.333%-1rem)] md:max-w-[280px]"
                >
                  <CardHeader className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-primary mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-foreground">{member.name.charAt(0)}</span>
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
          <div className="flex justify-center w-full">
            <Card className="bg-primary/5 border-primary/20 cosmic-shadow max-w-4xl w-full">
              <CardContent className="py-8 text-center space-y-4 flex flex-col items-center">
                <p className="text-lg text-foreground font-medium">Powered by NASA Open Science Data</p>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                  This project is built on publicly available NASA data and is committed to open science principles. All
                  data sources are freely accessible to researchers worldwide.
                </p>
                <Button variant="outline" className="bg-transparent" asChild>
                  <a
                    href="https://github.com/ZarinTasnimNadia/AstroLife-Engine"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    View Project on GitHub
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}