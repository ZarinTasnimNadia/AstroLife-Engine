import { AIChat } from "@/components/ai-chat"

export default function ChatPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          AI Research Assistant 🚀
        </h1>
        <p className="text-muted-foreground">
          Your friendly guide to NASA's space biology research. Ask anything - I'll explain it in a way that makes sense!
        </p>
      </div>
      
      <div className="h-[calc(100vh-200px)]">
        <AIChat />
      </div>
    </div>
  )
}
