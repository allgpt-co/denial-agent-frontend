import { Braces } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CopyButton } from "@/components/ui/copy-button"
import { cn } from "@/lib/utils"

interface JsonChipProps {
    content: string | object
    className?: string
}

export function JsonChip({ content, className }: JsonChipProps) {
    let parsedJson: any = null
    let isValidJson = false

    if (typeof content === "string") {
        try {
            parsedJson = JSON.parse(content)
            // Only treat as valid JSON if it's an object or array, not a primitive like "true" or "123"
            if (typeof parsedJson === 'object' && parsedJson !== null) {
                isValidJson = true
            }
        } catch (e) {
            // Invalid JSON
        }
    } else if (typeof content === "object" && content !== null) {
        parsedJson = content
        isValidJson = true
    }

    // If not valid or is a primitive, fall back to simple code display
    if (!isValidJson) {
        return (
            <code className={cn("rounded-md bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm", className)}>
                {typeof content === 'string' ? content : JSON.stringify(content)}
            </code>
        )
    }

    const label = Array.isArray(parsedJson)
        ? `Array [${parsedJson.length}]`
        : "Data"

    const formattedJson = JSON.stringify(parsedJson, null, 2)

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer select-none",
                        className
                    )}
                >
                    <Braces className="h-3 w-3" />
                    <span className="truncate max-w-[200px]">{label}</span>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] max-w-[90vw] p-0" align="start">
                <div className="flex items-center justify-between border-b px-3 py-2 bg-muted/30">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Braces className="h-4 w-4" />
                        <span>Data Viewer</span>
                    </div>
                    <CopyButton content={formattedJson} copyMessage="Copied JSON" />
                </div>
                <div className="max-h-[500px] overflow-auto p-4 bg-background">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-words text-foreground">
                        {formattedJson}
                    </pre>
                </div>
            </PopoverContent>
        </Popover>
    )
}
