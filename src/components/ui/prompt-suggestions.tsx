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
    <div className="flex h-full flex-col items-center justify-start sm:justify-center space-y-8 sm:space-y-12 px-4 py-8 sm:py-12 md:py-16 animate-in fade-in zoom-in-95 duration-700 overflow-y-auto">
      <div className="space-y-4 sm:space-y-6 text-center max-w-2xl">
        <div className="mx-auto flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent shadow-inner mb-4 sm:mb-8 ring-1 ring-primary/20">
          <Sparkles className="h-7 w-7 sm:h-10 sm:w-10 text-primary animate-pulse" />
        </div>
        <div className="space-y-1 sm:space-y-2">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
            How can I help you today?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground/80 leading-relaxed max-w-lg mx-auto">
            {label || "Experience the power of our specialized agents. Choose a task below to get started immediately."}
          </p>
        </div>
      </div>

      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="h-px flex-1 bg-border/40" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
            Starter Prompts
          </span>
          <div className="h-px flex-1 bg-border/40" />
        </div>

        <div className="flex flex-wrap items-stretch justify-center w-full gap-3 lg:mx-auto">
          {suggestions.map((suggestion, index) => {
            const Icon = ICONS[index % ICONS.length]
            return (
              <button
                key={suggestion}
                onClick={() => append({ role: "user", content: suggestion })}
                className={cn(
                  "group relative flex flex-1 flex-row items-center gap-4 sm:gap-5 rounded-xl sm:rounded-2xl border bg-card/40 p-4 sm:p-6 text-left transition-all duration-500 backdrop-blur-sm",
                  "hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 hover:bg-card/60",
                  "border-border/40 active:scale-[0.98] overflow-hidden",
                  "min-w-[280px] max-w-full md:max-w-[calc(50%-0.75rem)]"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex flex-shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/5 text-primary transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm group-hover:shadow-lg">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="relative flex-1 space-y-0.5 sm:space-y-1.5">
                  <p className="font-bold text-[14px] sm:text-[17px] text-foreground group-hover:text-primary transition-colors leading-tight">
                    {suggestion}
                  </p>
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground/60 flex items-center gap-1.5">
                    Click to start this task <ChevronRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
