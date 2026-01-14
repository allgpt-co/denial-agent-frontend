import { History, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { Thread } from '@/lib/types'

interface ChatHistoryProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    threads: Thread[]
    currentThreadId: string | null
    onSelectThread: (threadId: string) => void
    onNewChat: () => void
    isRefreshing: boolean
    onFetchHistory: () => void
    direction?: 'left' | 'right' | 'top' | 'bottom'
}

export function ChatHistory({
    isOpen,
    onOpenChange,
    threads,
    currentThreadId,
    onSelectThread,
    onNewChat,
    isRefreshing,
    onFetchHistory,
    direction = 'right'
}: ChatHistoryProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onFetchHistory}
                    title="Chat History"
                    className="h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
                >
                    <History className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent side={direction} className="w-[300px] sm:w-[400px] border-l border-border/40 backdrop-blur-2xl">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl font-bold tracking-tight">Chat History</SheetTitle>
                    <SheetDescription className="text-sm">
                        Select a previous conversation to continue.
                    </SheetDescription>
                </SheetHeader>

                <div className="px-2">
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2.5 rounded-xl border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium"
                        onClick={onNewChat}
                        disabled={isRefreshing}
                    >
                        <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} /> New Conversation
                    </Button>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-220px)] pr-2 mt-6 custom-scrollbar">
                    {threads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-4 text-muted-foreground/40">
                                <History className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">No recent conversations</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Start chatting to see history here.</p>
                        </div>
                    ) : (
                        threads.map((thread) => (
                            <button
                                key={thread.thread_id}
                                className={cn(
                                    "group flex flex-col gap-1 w-full text-left p-3.5 rounded-xl transition-all duration-200 border border-transparent",
                                    currentThreadId === thread.thread_id
                                        ? "bg-primary/5 border-primary/20 shadow-sm"
                                        : "hover:bg-muted/50 hover:border-border/50"
                                )}
                                onClick={() => onSelectThread(thread.thread_id)}
                            >
                                <span className={cn(
                                    "font-semibold truncate text-[13px]",
                                    currentThreadId === thread.thread_id ? "text-primary" : "text-foreground"
                                )}>
                                    {thread.thread_id || "Untitled Conversation"}
                                </span>
                                <span className="text-[11px] text-muted-foreground flex items-center gap-2">
                                    {thread.updated_at ? new Date(thread.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently"}
                                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                    {thread.updated_at ? new Date(thread.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
