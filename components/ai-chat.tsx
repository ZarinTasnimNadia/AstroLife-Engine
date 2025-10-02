"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, Bot, User, Loader2, MessageSquare, BookOpen, Link as LinkIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ChatMessage {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  references?: Array<{
    id: number
    title: string
    authors: string[]
    doi: string
    journal: string
    publication_date: string
    relevance_score?: number
  }>
  similar_articles?: Array<{
    id: number
    title: string
    authors: string[]
    doi: string
    journal: string
    publication_date: string
    similarity_score?: number
  }>
}

interface AIChatProps {
  className?: string
}

export function AIChat({ className }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "ai",
      content: "Hey there! 👋 I'm your friendly AI research assistant, and I'm excited to help you explore NASA's fascinating space biology research! Think of me as your guide through decades of discoveries about how life adapts to space.\n\nI can help you:\n• Understand complex research in simple terms\n• Find specific studies and publications\n• Explore connections between different experiments\n• Answer questions about space biology topics\n\nWhat are you curious about today? 🚀",
      timestamp: new Date(),
      references: [],
      similar_articles: []
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const suggestedQuestions = [
    "How does microgravity affect human muscles?",
    "What happens to plants in space?",
    "Tell me about radiation effects on astronauts",
    "How does the immune system change in space?"
  ]

  const handleSuggestionClick = (question: string) => {
    setInput(question)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setShowSuggestions(false)

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input.trim(),
          limit: 10
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.response,
        timestamp: new Date(),
        references: data.references || [],
        similar_articles: data.similar_articles || []
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error("Error in AI chat:", error)
      setError(error instanceof Error ? error.message : "Failed to get AI response")
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "Oops! 😅 I hit a little snag while processing that. Mind trying again? Sometimes these things just need a second attempt!",
        timestamp: new Date(),
        references: [],
        similar_articles: []
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatAuthors = (authors: string[]) => {
    if (authors.length <= 2) return authors.join(", ")
    return `${authors.slice(0, 2).join(", ")}, et al.`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).getFullYear().toString()
  }

  const getDOIUrl = (doi: string) => {
    if (doi.startsWith('http')) return doi
    return `https://doi.org/${doi}`
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            AI Research Assistant
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${
                      message.type === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {message.type === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div
                      className={`rounded-lg p-4 ${
                        message.type === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      
                      {message.timestamp && (
                        <div
                          className={`text-xs mt-2 opacity-70 ${
                            message.type === "user" ? "text-primary-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* References and Similar Articles */}
          {messages.length > 0 && messages[messages.length - 1].type === "ai" && 
           (messages[messages.length - 1].references?.length || messages[messages.length - 1].similar_articles?.length) && (
            <div className="border-t p-6 space-y-4">
              {messages[messages.length - 1].references && messages[messages.length - 1].references!.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    References
                  </h4>
                  <div className="space-y-2">
                    {messages[messages.length - 1].references!.map((ref, index) => (
                      <div key={ref.id} className="bg-muted/50 rounded-lg p-3 text-sm">
                        <div className="font-medium text-foreground mb-1">
                          {ref.title}
                        </div>
                        <div className="text-muted-foreground mb-2">
                          {formatAuthors(ref.authors)} • {ref.journal} • {formatDate(ref.publication_date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            DOI: {ref.doi}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            asChild
                          >
                            <a
                              href={getDOIUrl(ref.doi)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {messages[messages.length - 1].similar_articles && messages[messages.length - 1].similar_articles!.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Similar Articles
                  </h4>
                  <div className="space-y-2">
                    {messages[messages.length - 1].similar_articles!.map((article, index) => (
                      <div key={article.id} className="bg-muted/50 rounded-lg p-3 text-sm">
                        <div className="font-medium text-foreground mb-1">
                          {article.title}
                        </div>
                        <div className="text-muted-foreground mb-2">
                          {formatAuthors(article.authors)} • {article.journal} • {formatDate(article.publication_date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            DOI: {article.doi}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            asChild
                          >
                            <a
                              href={getDOIUrl(article.doi)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {error && (
            <div className="px-6 pb-4">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
          
          {showSuggestions && messages.length === 1 && (
            <div className="px-6 pb-4">
              <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(question)}
                    className="text-xs"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="border-t p-6">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about space biology research..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Send"
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
