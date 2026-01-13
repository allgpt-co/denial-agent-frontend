import { useState } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FeedbackProps {
    messageId: string
    onRateResponse: (messageId: string, rating: "thumbs-up" | "thumbs-down") => void
}

export default function Feedback({ messageId, onRateResponse }: FeedbackProps) {
    const [rating, setRating] = useState<"thumbs-up" | "thumbs-down" | null>(null)

    const handleRate = (value: "thumbs-up" | "thumbs-down") => {
        if (rating === value) return
        setRating(value)
        onRateResponse(messageId, value)
    }

    return (
        <div className="flex items-center gap-0.5">
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "h-6 w-6 transition-colors",
                    rating === "thumbs-up" && "text-green-500 bg-green-500/10"
                )}
                onClick={() => handleRate("thumbs-up")}
                aria-label="Thumbs up"
            >
                <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "h-6 w-6 transition-colors",
                    rating === "thumbs-down" && "text-red-500 bg-red-500/10"
                )}
                onClick={() => handleRate("thumbs-down")}
                aria-label="Thumbs down"
            >
                <ThumbsDown className="h-3 w-3" />
            </Button>
        </div>
    )
}
