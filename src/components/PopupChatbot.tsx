import { useState, useEffect } from 'react'
import { AgentChat, type AgentChatProps } from './AgentChat'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { MessageCircle } from 'lucide-react'
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
    const [isExpanded, setIsExpanded] = useState(false)
    const [dimensions, setDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0
    })

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <div className="chat-theme">
                <PopoverTrigger asChild className={cn(isOpen && "opacity-0 pointer-events-none")}>
                    <Button
                        className={cn(
                            "fixed bottom-6 right-6 size-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50",
                            buttonClassName
                        )}
                        size="icon"
                    >
                        <MessageCircle className="size-6" />
                    </Button>
                </PopoverTrigger>
            </div>
            <PopoverContent
                className={cn(
                    "p-0 overflow-hidden rounded-2xl border border-border/50 shadow-2xl transition-all duration-300 bg-background",
                    windowClassName
                )}
                style={{
                    width: isExpanded
                        ? `${dimensions.width}px`
                        : (dimensions.width < 640 ? '90vw' : '480px'),
                    height: isExpanded
                        ? `${dimensions.height}px`
                        : (dimensions.width < 640 ? '80vh' : '640px'),
                }}
                align="end"
                sideOffset={-64}
            >
                <div className="chat-theme h-full">
                    <AgentChat
                        {...props}
                        className="h-full w-full"
                        onExpand={() => setIsExpanded(!isExpanded)}
                        isExpanded={isExpanded}
                        onClose={() => setIsOpen(false)}
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}
