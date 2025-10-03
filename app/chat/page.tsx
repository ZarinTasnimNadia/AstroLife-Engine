import { AIChat } from "@/components/ai-chat"
import { Navigation } from "@/components/navigation"

export default function ChatPage() {
  return (
    <div className="min-h-screen cosmic-bg">
      <div className="mars"></div>
      <div className="moon"></div>

      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
            AI Research Assistant 🚀
          </h1>
          <p className="text-lg text-muted-foreground">
            Your friendly guide to NASA's space biology research. Ask anything - I'll explain it in a way that makes sense!
          </p>
        </div>
        
        <div className="h-[calc(100vh-200px)]">
          <AIChat />
        </div>
      </main>
    </div>
  )
}
