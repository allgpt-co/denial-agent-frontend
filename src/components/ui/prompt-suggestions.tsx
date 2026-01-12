import { MessageSquare, Sparkles, Search, HelpCircle, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PromptSuggestionsProps {
  label: string
  append: (message: { role: "user"; content: string }) => void
  suggestions: string[]
}

const ICONS = [MessageSquare, Sparkles, Search, HelpCircle]

export function PromptSuggestions({
  label,
  append,
  suggestions,
}: PromptSuggestionsProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-12 px-4 py-20 animate-in fade-in zoom-in-95 duration-700">
      <div className="space-y-6 text-center max-w-2xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent shadow-inner mb-8 ring-1 ring-primary/20">
          <Sparkles className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tight sm:text-6xl bg-gradient-to-br from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
            {label || "How can I help you today?"}
          </h2>
          <p className="text-lg text-muted-foreground/80 leading-relaxed max-w-lg mx-auto">
            Experience the power of our specialized RCM agents. Choose a task below to get started immediately.
          </p>
        </div>
      </div>

      <div className="grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:mx-auto">
        {suggestions.map((suggestion, index) => {
          const Icon = ICONS[index % ICONS.length]
          return (
            <button
              key={suggestion}
              onClick={() => append({ role: "user", content: suggestion })}
              className={cn(
                "group relative flex flex-row items-center gap-5 rounded-2xl border bg-card/40 p-6 text-left transition-all duration-500 backdrop-blur-sm",
                "hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 hover:bg-card/60",
                "border-border/40 active:scale-[0.98] overflow-hidden"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex flex-shrink-0 h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm group-hover:shadow-lg">
                <Icon className="h-6 w-6" />
              </div>
              <div className="relative flex-1 space-y-1.5">
                <p className="font-bold text-[17px] text-foreground group-hover:text-primary transition-colors leading-tight">
                  {suggestion}
                </p>
                <p className="text-xs font-medium text-muted-foreground/60 flex items-center gap-1.5">
                  Click to start this task <ChevronRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
