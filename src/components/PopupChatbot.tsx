import { useState } from 'react'
import { AgentChat, type AgentChatProps } from './AgentChat'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { MessageCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PopupChatbotProps extends AgentChatProps {
    buttonClassName?: string
    windowClassName?: string
}

export function PopupChatbot({
    buttonClassName,
    windowClassName,
    ...props
}: PopupChatbotProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    className={cn(
                        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50",
                        isOpen ? "rotate-90 bg-destructive hover:bg-destructive/90 text-destructive-foreground" : "rotate-0",
                        buttonClassName
                    )}
                    size="icon"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={cn("w-[90vw] sm:w-[400px] h-[80vh] sm:h-[600px] p-0 overflow-hidden rounded-2xl border border-border/50 shadow-2xl mr-4 mb-4", windowClassName)}
                align="end"
                sideOffset={16}
            >
                <AgentChat {...props} className="h-full w-full" />
            </PopoverContent>
        </Popover>
    ) as any
}
