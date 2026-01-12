import { useEffect, useState, useCallback } from 'react'
import { AgentClient } from '@/lib/agent-client'
import { Chat } from '@/components/ui/chat'
import type { Message } from '@/components/ui/chat-message'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetDescription,
} from '@/components/ui/sheet'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { History, Plus, Settings2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Thread, ChatMessage as AgentChatMessage } from '@/lib/types'

export interface AgentChatProps {
    baseUrl: string
    agent?: string
    model?: string
    userId?: string
    placeholder?: string
    enableStreaming?: boolean
    suggestions?: string[]
    onError?: (error: Error) => void
    onRateResponse?: (messageId: string, rating: 'thumbs-up' | 'thumbs-down') => void
    className?: string
    showSettings?: boolean
    showHeader?: boolean
    direction?: 'left' | 'right' | 'top' | 'bottom'
    input?: string
    setInput?: (value: string) => void
}

export function AgentChat({
    baseUrl,
    agent: initialAgent = 'default',
    userId,
    enableStreaming = true,
    suggestions = [],
    onError,
    onRateResponse,
    className,
    showSettings = true,
    showHeader = true,
    placeholder = '',
    direction = 'right',
    input: propInput,
    setInput: propSetInput,
    model: initialModel,
}: AgentChatProps) {
    // State for Chat
    const [messages, setMessages] = useState<Message[]>([])
    const [internalInput, setInternalInput] = useState('')

    const input = propInput !== undefined ? propInput : internalInput
    const setInput = (value: string) => {
        if (propInput === undefined) {
            setInternalInput(value)
        }
        propSetInput?.(value)
    }
    const [isGenerating, setIsGenerating] = useState(false)
    const [followupSuggestions, setFollowupSuggestions] = useState<string[]>([])

    // State for Agent/Model Configuration
    const [client, setClient] = useState<AgentClient | null>(null)
    const [currentAgent, setCurrentAgent] = useState<string>(initialAgent)
    const [currentModel, setCurrentModel] = useState<string>(initialModel || '')
    const [availableAgents, setAvailableAgents] = useState<{ key: string; description: string }[]>([])
    const [availableModels, setAvailableModels] = useState<string[]>([])

    // State for UI Toggles
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)

    // State for History
    const [threads, setThreads] = useState<Thread[]>([])
    const [currentThreadId, setCurrentThreadId] = useState<string | null>(null)

    // Initialize Client
    useEffect(() => {
        const initClient = async () => {
            try {
                const newClient = new AgentClient({
                    baseUrl,
                    agent: currentAgent,
                    getInfo: true,
                })

                await newClient.retrieveInfo()
                setClient(newClient)

                if (newClient.info) {
                    setAvailableAgents(newClient.info.agents)
                    setAvailableModels(newClient.info.models)
                    if (!currentModel) {
                        setCurrentModel(newClient.info.default_model)
                    }
                }
            } catch (err) {
                if (err instanceof Error) onError?.(err)
            }
        }

        initClient()
    }, [baseUrl, onError]) // Only re-init if baseUrl changes, we handle agent updates separately

    // Update Client when Agent changes
    useEffect(() => {
        if (client) {
            try {
                client.updateAgent(currentAgent, true) // skipVerify if info not fully synced yet, but we should rely on init
            } catch (e) {
                console.warn("Could not update agent yet", e)
            }
        }
    }, [currentAgent, client])

    // Fetch History Threads
    const fetchHistory = useCallback(async () => {
        if (!client) return
        try {
            const threadList = await client.listThreads(20, 0, userId)
            console.log("Thread List", threadList)
            setThreads(threadList)
        } catch (err) {
            console.error("Failed to fetch history", err)
        }
    }, [client, userId])

    // Load a specific thread
    const loadThread = async (threadId: string) => {
        if (!client) return
        try {
            setIsGenerating(true)
            const history = await client.getHistory({ thread_id: threadId })
            const convertedMessages: Message[] = history.messages.map((msg) => ({
                id: msg.id || crypto.randomUUID(),
                role: msg.type === 'human' ? 'user' : 'assistant',
                content: msg.content,
                createdAt: new Date(), // We assume current time if timestamp missing
                // Map other fields if necessary
            }))
            setMessages(convertedMessages)
            setCurrentThreadId(threadId)
            setIsHistoryOpen(false)
        } catch (err) {
            if (err instanceof Error) onError?.(err)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleNewChat = () => {
        setMessages([])
        setFollowupSuggestions([])
        setCurrentThreadId(null)
        setInput('')
        setIsHistoryOpen(false)
    }

    // Helper to extract followup suggestions from content
    const extractSuggestions = (content: string) => {
        // Handle JSON format: { "questions": [...] } possibly wrapped in code blocks
        const jsonMatch = content.match(/(?:```(?:json)?\s*)?({\s*"questions":\s*\[.*?\]\s*})(?:\s*```)?/s)
        if (jsonMatch) {
            try {
                const jsonStr = jsonMatch[1] // The inner JSON object
                const data = JSON.parse(jsonStr)
                const suggestions = data.questions || []
                const cleanContent = content.replace(jsonMatch[0], '').trim()
                return { suggestions, cleanContent }
            } catch (e) {
                console.error("Failed to parse followup JSON", e)
            }
        }

        // Legacy format: [FOLLOWUP: sug 1, sug 2]
        const oldMatch = content.match(/\[FOLLOWUP:\s*(.*?)\]/)
        if (oldMatch) {
            const suggestionsStr = oldMatch[1]
            const suggestions = suggestionsStr.split(',').map(s => s.trim()).filter(Boolean)
            const cleanContent = content.replace(/\[FOLLOWUP:\s*.*?\]/, '').trim()
            return { suggestions, cleanContent }
        }

        return { suggestions: [], cleanContent: content }
    }

    // Handle Send Message
    const handleSubmit = async (event?: { preventDefault?: () => void }) => {
        event?.preventDefault?.()
        if (!input.trim() || !client) return

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: input,
            createdAt: new Date(),
        }

        setMessages((prev) => [...prev, userMsg])
        setInput('')
        setFollowupSuggestions([])
        setIsGenerating(true)

        const threadId = currentThreadId || crypto.randomUUID()
        if (!currentThreadId) {
            setCurrentThreadId(threadId)
        }

        const threadConfig = {
            thread_id: threadId,
            user_id: userId
        }

        try {
            if (enableStreaming) {
                const stream = client.stream({
                    message: userMsg.content,
                    model: currentModel || undefined,
                    ...threadConfig
                })

                let currentMessageId: string | null = null

                for await (const chunk of stream) {
                    if (typeof chunk === 'string') {
                        setMessages((prev) => {
                            let targetId = currentMessageId
                            const lastMsg = prev[prev.length - 1]

                            if (targetId && lastMsg && lastMsg.id === targetId && lastMsg.role === 'assistant' && !lastMsg.toolInvocations) {
                                return prev.map(m => m.id === targetId ? { ...m, content: m.content + chunk } : m)
                            } else {
                                const newId = crypto.randomUUID()
                                currentMessageId = newId
                                return [...prev, {
                                    id: newId,
                                    role: 'assistant',
                                    content: chunk,
                                    createdAt: new Date()
                                }]
                            }
                        })
                    } else if (typeof chunk === 'object' && chunk !== null) {
                        const msg = chunk as AgentChatMessage

                        if (msg.tool_calls && msg.tool_calls.length > 0) {
                            const isSubAgent = msg.tool_calls.some(tc => tc.name.includes('sub-agent'))
                            const role = isSubAgent ? 'subagent' : 'tool'

                            const toolInvocations = msg.tool_calls.map(tc => ({
                                state: 'call' as const,
                                toolName: tc.name,
                                toolCallId: tc.id || crypto.randomUUID()
                            }))

                            currentMessageId = null

                            setMessages(prev => [...prev, {
                                id: crypto.randomUUID(),
                                role: role as any,
                                content: msg.content || '',
                                toolInvocations,
                                createdAt: new Date()
                            }])
                        } else if (msg.type === 'tool' && msg.content) {
                            currentMessageId = null
                            setMessages(prev => [...prev, {
                                id: crypto.randomUUID(),
                                role: 'tool',
                                content: msg.content,
                                createdAt: new Date()
                            }])
                        } else if (msg.content) {
                            setMessages((prev) => {
                                let targetId = currentMessageId
                                const lastMsg = prev[prev.length - 1]

                                if (targetId && lastMsg && lastMsg.id === targetId && lastMsg.role === 'assistant' && !lastMsg.toolInvocations) {
                                    return prev.map(m => m.id === targetId ? { ...m, content: m.content + msg.content } : m)
                                } else {
                                    const newId = crypto.randomUUID()
                                    currentMessageId = newId
                                    return [...prev, {
                                        id: newId,
                                        role: 'assistant',
                                        content: msg.content,
                                        createdAt: new Date()
                                    }]
                                }
                            })
                        }
                    }
                }

                // After stream ends, extract suggestions from the last message
                setMessages(prev => {
                    const lastMsg = prev[prev.length - 1]
                    if (lastMsg && lastMsg.role === 'assistant') {
                        const { suggestions, cleanContent } = extractSuggestions(lastMsg.content)
                        if (suggestions.length > 0) {
                            setFollowupSuggestions(suggestions)
                            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: cleanContent } : m)
                        }
                    }
                    return prev
                })
            } else {
                const response = await client.invoke({
                    message: userMsg.content,
                    model: currentModel || undefined,
                    ...threadConfig
                })

                // Use suggestions from API response if available, otherwise try to extract from content
                if (response.suggestions && response.suggestions.length > 0) {
                    setFollowupSuggestions(response.suggestions)
                } else {
                    const { suggestions } = extractSuggestions(response.content || '')
                    if (suggestions.length > 0) setFollowupSuggestions(suggestions)
                }

                setMessages((prev) => [
                    ...prev,
                    {
                        id: response.id || crypto.randomUUID(),
                        role: 'assistant',
                        content: response.content,
                        createdAt: new Date()
                    }
                ])
            }
        } catch (err) {
            if (err instanceof Error) onError?.(err)
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: 'Error processing request. Please try again.',
                    createdAt: new Date()
                }
            ])
        } finally {
            setIsGenerating(false)
            fetchHistory() // Refresh history to show new thread if created
        }
    }

    // Handle Input Change
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
    }

    return (
        <div className={cn("flex h-full w-full flex-col overflow-hidden", className)}>
            {/* Header / Settings Bar */}
            {showHeader && (
                <div className="absolute top-0 left-0 right-0 z-30 transition-all duration-300">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-background/60 p-2.5 shadow-2xl backdrop-blur-2xl ring-1 ring-black/5">
                            <div className="flex items-center gap-3.5 px-1.5">
                                <div className="relative group">
                                    <div className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-primary to-primary/40 opacity-25 blur transition duration-300 group-hover:opacity-40" />
                                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-lg">
                                        <Sparkles className="h-5.5 w-5.5" />
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500 shadow-sm" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-[15px] font-bold leading-tight tracking-tight text-foreground sm:text-base">
                                        Agent Chat
                                    </h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                            {currentAgent} <span className="mx-1 opacity-30">|</span> {currentModel}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={fetchHistory} title="Chat History" className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors">
                                            <History className="h-4.5 w-4.5" />
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
                                                onClick={handleNewChat}
                                            >
                                                <Plus className="h-4 w-4" /> New Conversation
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
                                                        onClick={() => loadThread(thread.thread_id)}
                                                    >
                                                        <span className={cn(
                                                            "font-semibold truncate text-[13px]",
                                                            currentThreadId === thread.thread_id ? "text-primary" : "text-foreground"
                                                        )}>
                                                            {thread.title || "Untitled Conversation"}
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

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleNewChat}
                                    title="New Chat"
                                    className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors"
                                >
                                    <Plus className="h-4.5 w-4.5" />
                                </Button>

                                {showSettings && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors"
                                            >
                                                <Settings2 className="h-4.5 w-4.5" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="end" className="w-[280px] p-5 rounded-2xl shadow-2xl border-border/40 backdrop-blur-2xl ring-1 ring-black/5">
                                            <div className="flex flex-col gap-5">
                                                <div className="space-y-1.5">
                                                    <h4 className="font-bold text-base leading-none tracking-tight">Configuration</h4>
                                                    <p className="text-xs text-muted-foreground/80 leading-relaxed">
                                                        Customize your AI agent and model settings for the current session.
                                                    </p>
                                                </div>
                                                <div className="grid gap-4">
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5">Active Agent</label>
                                                        <Select value={currentAgent} onValueChange={setCurrentAgent}>
                                                            <SelectTrigger className="h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20">
                                                                <SelectValue placeholder="Select Agent" />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl border-border/40 shadow-xl">
                                                                {availableAgents.map((agent) => (
                                                                    <SelectItem key={agent.key} value={agent.key} className="text-xs rounded-md my-0.5">
                                                                        {agent.key}
                                                                    </SelectItem>
                                                                ))}
                                                                {availableAgents.length === 0 && (
                                                                    <SelectItem value={currentAgent || "default"}>{currentAgent || "Default"}</SelectItem>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5">LLM Model</label>
                                                        <Select value={currentModel} onValueChange={setCurrentModel}>
                                                            <SelectTrigger className="h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20">
                                                                <SelectValue placeholder="Select Model" />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl border-border/40 shadow-xl">
                                                                {availableModels.map((model) => (
                                                                    <SelectItem key={model} value={model} className="text-xs rounded-md my-0.5">
                                                                        {model}
                                                                    </SelectItem>
                                                                ))}
                                                                {availableModels.length === 0 && (
                                                                    <SelectItem value={currentModel || "default"}>{currentModel || "Default"}</SelectItem>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Chat Area */}
            <div className="flex-1 overflow-hidden relative bg-background pt-24">
                <Chat
                    messages={messages}
                    handleSubmit={handleSubmit}
                    input={input}
                    handleInputChange={handleInputChange}
                    isGenerating={isGenerating}
                    stop={() => { /* Implement stop logic if needed */ }}
                    append={async (msg) => {
                        setInput(msg.content)
                        setMessages(prev => [...prev, { ...msg, id: crypto.randomUUID(), createdAt: new Date() } as Message])
                        setIsGenerating(true)

                        const threadId = currentThreadId || crypto.randomUUID()
                        if (!currentThreadId) setCurrentThreadId(threadId)

                        try {
                            if (!client) return
                            const response = await client.invoke({
                                message: msg.content,
                                model: currentModel || undefined,
                                thread_id: threadId,
                                user_id: userId
                            })

                            const { suggestions: newSuggestions, cleanContent } = extractSuggestions(response.content || '')
                            if (newSuggestions.length > 0) setFollowupSuggestions(newSuggestions)

                            setMessages(prev => [...prev, {
                                id: response.id || crypto.randomUUID(),
                                role: 'assistant',
                                content: cleanContent,
                                createdAt: new Date()
                            }])
                        } catch (err) {
                            if (err instanceof Error) onError?.(err)
                        } finally {
                            setIsGenerating(false)
                            fetchHistory()
                        }
                    }}
                    suggestions={messages.length === 0 ? suggestions : followupSuggestions}
                    onRateResponse={onRateResponse}
                    placeholder={placeholder}
                />
            </div>
        </div>
    ) as any
}
