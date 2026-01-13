import { Chatbot, type ChatbotProps } from "./chatbot"
import { cn } from "@/lib/utils"

export interface FullChatbotProps extends ChatbotProps {
    className?: string
}

export function FullChatbot(props: FullChatbotProps) {
    return (
        <div className={cn("w-full h-screen flex flex-col", props.className)}>
            <Chatbot {...props} />
        </div>
    )
}
