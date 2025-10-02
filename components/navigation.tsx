"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Explore" },
    { href: "/graph", label: "Knowledge Graph" },
    { href: "/analytics", label: "Analytics" },
    { href: "/about", label: "About" },
  ]

  return (
    <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary flex items-center justify-center">
            <Rocket className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-xl gradient-text-cosmic">AstroLife Engine</span>
        </Link>
        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/20 text-primary border border-primary shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/10",
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
