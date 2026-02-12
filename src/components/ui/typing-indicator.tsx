import { Loader2 } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="justify-left flex gap-2">
      <div className="rounded-lg bg-muted p-3 flex items-center space-x-2 opacity-50 text-sm">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    </div>
  )
}
