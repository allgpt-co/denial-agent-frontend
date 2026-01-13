import React, { useState, useCallback, useEffect, useRef, useMemo, memo } from "react"
import { Chat } from "@/components/ui/chat"
import { Header } from "./header"
import { useChatbotApi, type ChatMessage, type Thread } from "@/hooks/use-chatbot-api"
import { type Message } from "@/components/ui/chat-message"
import { cn } from "@/lib/utils"
import Footer from "./footer"
import { useVoice } from "@/hooks/use-voice"
import { Disclaimer } from "./disclaimer"
import { motion, AnimatePresence } from "framer-motion"
import { History as HistoryIcon, MessageSquare, Calendar, ChevronRight, Loader2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ChatbotHeaderProps {
    show?: boolean
    title?: string
    titleUrl?: string
    subtitle?: string
    avatar?: string
    allowMaximize?: boolean
    onMaximizeToggle?: (isMaximized: boolean) => void
    onClose?: () => void
    onRefresh?: () => void
}

export interface ChatbotFooterProps {
    show?: boolean
    text?: string
    subtitle?: string
}

export interface ChatbotStarterProps {
    message?: string
    suggestions?: string[]
}

export interface ChatbotProps {
    url: string
    agent?: string
    model?: string
    placeholder?: string
    threadId?: string
    userId?: string
    stream?: boolean
    className?: string
    storageKey?: string
    header?: ChatbotHeaderProps
    footer?: ChatbotFooterProps
    starter?: ChatbotStarterProps
    isMaximized?: boolean
}

// Memoized Chat wrapper to prevent re-renders when only parent state changes
const MemoizedChat = memo(Chat)

export function Chatbot({
    url,
    agent: initialAgent,
    model: initialModel,
    placeholder = "Hi, how can I help you?",
    threadId,
    userId,
    stream = true,
    className,
    storageKey,
    header = {},
    footer = {},
    starter = {},
    isMaximized: propsIsMaximized,
}: ChatbotProps) {
    const {
        show: showHeader = true,
        title: headerTitle,
        titleUrl: headerTitleUrl,
        subtitle: headerSubtitle,
        avatar,
        allowMaximize = false,
        onMaximizeToggle,
        onClose,
        onRefresh,
    } = header

    const {
        show: showFooter = true,
        text: footerContent,
        subtitle: footerSubtitle,
    } = footer

    const {
        message: starterMessage,
        suggestions: starterSuggestions,
    } = starter

    const [selectedAgent, setSelectedAgent] = useState(initialAgent || "")
    const [selectedModel, setSelectedModel] = useState(initialModel || "")
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [internalIsMaximized, setInternalIsMaximized] = useState(false)
    const isMaximized = propsIsMaximized ?? internalIsMaximized
    const [followUpPrompts, setFollowUpPrompts] = useState<string[]>([])
    const currentMessageRef = useRef<string>("")
    const startTimeRef = useRef<number | null>(null)
    const pendingFollowUpRef = useRef<string[]>([])

    // History states
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const [threads, setThreads] = useState<Thread[]>([])
    const [isThreadsLoading, setIsThreadsLoading] = useState(false)
    const [currentThreadId, setCurrentThreadId] = useState<string>(threadId || "")

    // Initialize thread ID from local storage if not provided
    useEffect(() => {
        if (!currentThreadId && storageKey) {
            const savedThreadId = localStorage.getItem(`${storageKey}-thread-id`)
            if (savedThreadId) {
                setCurrentThreadId(savedThreadId)
            } else {
                const newThreadId = `thread-${Date.now()}`
                setCurrentThreadId(newThreadId)
                localStorage.setItem(`${storageKey}-thread-id`, newThreadId)
            }
        }
    }, [storageKey, currentThreadId])

    useEffect(() => {
        if (storageKey && currentThreadId) {
            localStorage.setItem(`${storageKey}-thread-id`, currentThreadId)
        }
    }, [storageKey, currentThreadId])

    const {
        metadata,
        streamMessage,
        stopStream,
        sendFeedback,
        getHistory,
        listThreads,
    } = useChatbotApi({
        url,
        agent: selectedAgent,
        model: selectedModel,
        threadId: currentThreadId,
        userId,
        stream,
    })

    // Load history from local storage
    useEffect(() => {
        if (storageKey && !isHistoryOpen) {
            const saved = localStorage.getItem(storageKey)
            if (saved) {
                try {
                    const parsed = JSON.parse(saved, (key, value) => {
                        if (key === "createdAt") return new Date(value)
                        return value
                    })
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setMessages(parsed)
                    }
                } catch (error) {
                    console.error("Failed to load chat history:", error)
                }
            }
        }
    }, [storageKey])

    // Save history to local storage with 500ms debounce
    useEffect(() => {
        if (storageKey && messages.length > 0) {
            const timeoutId = setTimeout(() => {
                localStorage.setItem(storageKey, JSON.stringify(messages))
            }, 500)
            return () => clearTimeout(timeoutId)
        }
    }, [messages, storageKey])

    const {
        isListening,
        transcript,
        startListening,
        stopListening,
        speak,
        availableVoices,
        selectedVoice,
        setSelectedVoice,
        voiceConfig,
        updateConfig,
        isRecognitionSupported,
    } = useVoice()

    const [autoSpeak, setAutoSpeak] = useState(false)
    const [showDisclaimer, setShowDisclaimer] = useState(false)

    useEffect(() => {
        const savedVoiceConfig = localStorage.getItem("voice-config")
        if (savedVoiceConfig) {
            try {
                const parsed = JSON.parse(savedVoiceConfig)
                updateConfig(parsed)
            } catch (e) {
                console.error("Failed to load voice config", e)
            }
        }

        const savedAutoSpeak = localStorage.getItem("auto-speak")
        if (savedAutoSpeak) {
            setAutoSpeak(savedAutoSpeak === "true")
        }

        const hasConsent = localStorage.getItem("chatbot-consent")
        if (!hasConsent) {
            setShowDisclaimer(true)
        }
    }, [updateConfig])

    const handleDisclaimerAccept = useCallback(() => {
        localStorage.setItem("chatbot-consent", "true")
        setShowDisclaimer(false)
    }, [])

    useEffect(() => {
        localStorage.setItem("voice-config", JSON.stringify(voiceConfig))
    }, [voiceConfig])

    useEffect(() => {
        localStorage.setItem("auto-speak", String(autoSpeak))
    }, [autoSpeak])

    useEffect(() => {
        if (transcript) {
            setInput(transcript)
        }
    }, [transcript])

    // Initialize agent and model from metadata
    useEffect(() => {
        if (metadata && !selectedAgent) {
            setSelectedAgent(metadata.default_agent)
        }
        if (metadata && !selectedModel) {
            setSelectedModel(metadata.default_model)
        }
    }, [metadata, selectedAgent, selectedModel])

    // Handle greeting message if no history exists
    useEffect(() => {
        if (messages.length > 0) return

        let content = starterMessage
        if (!content && metadata && selectedAgent) {
            const agentMetadata = metadata.agents.find(a => a.key === selectedAgent)
            content = agentMetadata?.description
        }

        if (content) {
            const greetingMessage: Message = {
                id: `greeting-${Date.now()}`,
                role: "assistant",
                content: content,
                createdAt: new Date(),
            }
            setMessages([greetingMessage])
        }
    }, [messages.length, starterMessage, metadata, selectedAgent])

    const [initialSuggestions, setInitialSuggestions] = useState<string[]>(
        () => starterSuggestions ?? []
    )

    useEffect(() => {
        const hasUserMessages = messages.some(m => m.role === "user")
        if (hasUserMessages) {
            setInitialSuggestions([])
        } else if (starterSuggestions && starterSuggestions.length > 0) {
            setInitialSuggestions(starterSuggestions)
        }
    }, [starterSuggestions, messages])

    const handleRefresh = useCallback(() => {
        setFollowUpPrompts([])
        setInput("")
        if (storageKey) {
            localStorage.removeItem(storageKey)
        }

        if (starterMessage) {
            const greetingMessage: Message = {
                id: `greeting-${Date.now()}`,
                role: "assistant",
                content: starterMessage,
                createdAt: new Date(),
            }
            setMessages([greetingMessage])
        } else {
            setMessages([])
        }
    }, [storageKey, starterMessage])

    const effectiveOnRefresh = onRefresh || handleRefresh

    const addMessage = useCallback((message: Message) => {
        setMessages((prev) => [...prev, message])
    }, [])

    const updateLastMessage = useCallback((id: string, updates: Partial<Message>) => {
        setMessages((prev) => {
            const updated = [...prev]
            const msgIndex = updated.findIndex(m => m.id === id)
            if (msgIndex !== -1) {
                updated[msgIndex] = { ...updated[msgIndex], ...updates }
            }
            return updated
        })
    }, [])

    const processMessageStream = useCallback(
        async (text: string) => {
            if (isGenerating) return

            setIsGenerating(true)
            setFollowUpPrompts([])
            pendingFollowUpRef.current = []
            startTimeRef.current = Date.now()

            const userMessage: Message = {
                id: `user-${Date.now()}`,
                role: "user",
                content: text,
                createdAt: new Date(),
            }
            addMessage(userMessage)

            const aiMessageId = `ai-${Date.now()}`
            const aiMessage: Message = {
                id: aiMessageId,
                role: "assistant",
                content: "",
                createdAt: new Date(),
            }
            addMessage(aiMessage)

            currentMessageRef.current = ""

            try {
                for await (const event of streamMessage(text)) {
                    if (event.type === "token" && typeof event.content === "string") {
                        currentMessageRef.current += event.content
                        updateLastMessage(aiMessageId, { content: currentMessageRef.current })
                    } else if (event.type === "message" && event.content) {
                        const chatMessage = event.content as ChatMessage

                        if (chatMessage.type === "tool") {
                            const toolName = chatMessage.name ||
                                chatMessage.response_metadata?.name ||
                                chatMessage.custom_data?.name ||
                                "Tool";

                            const rawResult = chatMessage.content;
                            const cleanResult = typeof rawResult === "string"
                                ? rawResult.replace(/\\n/g, "\n")
                                : rawResult;

                            const toolInvocation = {
                                state: "result" as const,
                                toolName,
                                toolCallId: chatMessage.tool_call_id,
                                result: cleanResult,
                            }

                            setMessages((prev) => {
                                const updated = [...prev]
                                const messageIndex = updated.findIndex(m => m.id === aiMessageId)
                                if (messageIndex !== -1) {
                                    const existingInvocations = updated[messageIndex].toolInvocations || []
                                    const filteredInvocations = existingInvocations.filter(
                                        (inv: any) => inv.toolCallId !== chatMessage.tool_call_id
                                    )
                                    updated[messageIndex] = {
                                        ...updated[messageIndex],
                                        toolInvocations: [...filteredInvocations, toolInvocation] as any,
                                    }
                                }
                                return updated
                            })
                            continue
                        }

                        if (chatMessage.tool_calls && chatMessage.tool_calls.length > 0) {
                            setMessages((prev) => {
                                const updated = [...prev]
                                const messageIndex = updated.findIndex(m => m.id === aiMessageId)
                                if (messageIndex !== -1) {
                                    const currentInvocations = updated[messageIndex].toolInvocations || []
                                    const nextInvocations = [...currentInvocations]

                                    chatMessage.tool_calls?.forEach(newCall => {
                                        const existingIndex = nextInvocations.findIndex((inv: any) => inv.toolCallId === newCall.id)
                                        if (existingIndex === -1) {
                                            nextInvocations.push({
                                                state: "call",
                                                toolName: newCall.name,
                                                toolCallId: newCall.id,
                                                args: newCall.args
                                            } as any)
                                        } else if ((nextInvocations[existingIndex] as any).state === "call") {
                                            nextInvocations[existingIndex] = {
                                                ...nextInvocations[existingIndex],
                                                args: newCall.args
                                            } as any
                                        }
                                    })

                                    updated[messageIndex] = {
                                        ...updated[messageIndex],
                                        toolInvocations: nextInvocations as any,
                                    }
                                }
                                return updated
                            })
                        }

                        // Only update if there's actual content to avoid resetting tokens during tool calls
                        if (chatMessage.content) {
                            currentMessageRef.current = chatMessage.content
                        }

                        let content = currentMessageRef.current
                        if (pendingFollowUpRef.current.length > 0) {
                            content +=
                                "\n\n**Follow-up suggestions:**\n" +
                                pendingFollowUpRef.current.map((s) => `- ${s}`).join("\n")
                            pendingFollowUpRef.current = []
                        }

                        updateLastMessage(aiMessageId, {
                            content,
                            custom_data: {
                                ...chatMessage.custom_data,
                                run_id: chatMessage.run_id,
                            },
                        })
                    } else if (event.type === "update" && event.updates) {
                        const followUp = event.updates.follow_up
                        if (Array.isArray(followUp)) {
                            setFollowUpPrompts(followUp)
                            pendingFollowUpRef.current = followUp

                            // Immediately update the last message to show suggestions
                            let content = currentMessageRef.current
                            if (followUp.length > 0) {
                                content +=
                                    "\n\n**Follow-up suggestions:**\n" +
                                    followUp.map((s) => `- ${s}`).join("\n")
                                pendingFollowUpRef.current = [] // Clear as we've now used it
                            }
                            updateLastMessage(aiMessageId, { content })
                        }
                    } else if (event.type === "error") {
                        updateLastMessage(aiMessageId, { content: `Error: ${event.content}` })
                    }
                }
            } catch (error) {
                console.error("Stream error:", error)
                updateLastMessage(aiMessageId, {
                    content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                })
            } finally {
                setIsGenerating(false)

                // Final update to ensure content is fully synced (including any trailing suggestions)
                let finalContent = currentMessageRef.current
                if (pendingFollowUpRef.current.length > 0) {
                    finalContent +=
                        "\n\n**Follow-up suggestions:**\n" +
                        pendingFollowUpRef.current.map((s) => `- ${s}`).join("\n")
                    pendingFollowUpRef.current = []
                }
                if (aiMessageId) {
                    updateLastMessage(aiMessageId, { content: finalContent })
                }

                if (autoSpeak && currentMessageRef.current && speak) {
                    speak(currentMessageRef.current)
                }
                currentMessageRef.current = ""
                startTimeRef.current = null
            }
        },
        [isGenerating, streamMessage, addMessage, updateLastMessage, autoSpeak, speak]
    )

    const fetchThreads = useCallback(async () => {
        setIsThreadsLoading(true)
        try {
            const data = await listThreads()
            setThreads(data)
        } catch (error) {
            console.error("Failed to fetch threads:", error)
        } finally {
            setIsThreadsLoading(false)
        }
    }, [listThreads])

    const handleLoadThread = useCallback(async (tid: string) => {
        setIsGenerating(true)
        try {
            const history = await getHistory(tid)
            const uiMessages: Message[] = []
            let currentAiMessage: any = null

            history.forEach((m, idx) => {
                if (m.type === "human") {
                    uiMessages.push({
                        id: `hist-user-${idx}`,
                        role: "user",
                        content: m.content,
                        createdAt: new Date(),
                    })
                    currentAiMessage = null
                } else if (m.type === "ai") {
                    const aiMsg: Message = {
                        id: `hist-ai-${idx}`,
                        role: "assistant",
                        content: m.content,
                        createdAt: new Date(),
                        custom_data: {
                            run_id: m.run_id
                        },
                        toolInvocations: m.tool_calls?.map(tc => ({
                            state: "call" as const,
                            toolName: tc.name,
                            toolCallId: tc.id,
                            args: tc.args
                        })) as any
                    }
                    uiMessages.push(aiMsg)
                    currentAiMessage = aiMsg
                } else if (m.type === "tool") {
                    if (currentAiMessage) {
                        const invocation = {
                            state: "result" as const,
                            toolName: m.name || "Tool",
                            toolCallId: m.tool_call_id,
                            result: m.content
                        }
                        currentAiMessage.toolInvocations = [
                            ...(currentAiMessage.toolInvocations || []).filter((inv: any) => inv.toolCallId !== m.tool_call_id),
                            invocation
                        ]
                    }
                }
            })

            setCurrentThreadId(tid)
            setMessages(uiMessages)
            setIsHistoryOpen(false)
        } catch (error) {
            console.error("Failed to load history:", error)
        } finally {
            setIsGenerating(false)
        }
    }, [getHistory])

    const startNewChat = useCallback(() => {
        const newThreadId = `thread-${Date.now()}`
        setCurrentThreadId(newThreadId)
        setMessages([])
        setFollowUpPrompts([])
        setIsHistoryOpen(false)

        if (starterMessage) {
            const greetingMessage: Message = {
                id: `greeting-${Date.now()}`,
                role: "assistant",
                content: starterMessage,
                createdAt: new Date(),
            }
            setMessages([greetingMessage])
        }
    }, [starterMessage])

    const handleSubmit = useCallback(
        async (event?: { preventDefault?: () => void }) => {
            event?.preventDefault?.()
            const msgContent = input.trim()
            if (!msgContent) return
            setInput("")
            await processMessageStream(msgContent)
        },
        [input, processMessageStream]
    )

    const handleAppend = useCallback(
        async (message: { role: "user"; content: string }) => {
            await processMessageStream(message.content)
        },
        [processMessageStream]
    )

    const handleStop = useCallback(() => {
        stopStream()
        setIsGenerating(false)
    }, [stopStream])

    const handleRateResponse = useCallback(
        async (messageId: string, rating: "thumbs-up" | "thumbs-down") => {
            const message = messages.find((m) => m.id === messageId)
            const runId = message?.custom_data?.run_id as string | undefined
            if (!runId) return
            try {
                await sendFeedback(runId, "human-feedback", rating === "thumbs-up" ? 1 : 0)
            } catch (error) {
                console.error("Failed to send feedback:", error)
            }
        },
        [messages, sendFeedback]
    )

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
    }, [])

    const toggleMaximize = useCallback(() => {
        const newState = !isMaximized
        setInternalIsMaximized(newState)
        onMaximizeToggle?.(newState)
    }, [isMaximized, onMaximizeToggle])

    const suggestions = useMemo(() => {
        if (followUpPrompts.length > 0) return followUpPrompts
        if (initialSuggestions.length > 0) return initialSuggestions
        return []
    }, [followUpPrompts, initialSuggestions])

    return (
        <div
            className={cn(
                "chatbot-theme flex flex-col h-full transition-all duration-300 ease-in-out relative",
                className,
                isMaximized && "fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none rounded-none border-0"
            )}
        >
            <Disclaimer open={showDisclaimer} onAccept={handleDisclaimerAccept} />
            {showHeader && (
                <Header
                    metadata={metadata}
                    selectedAgent={selectedAgent}
                    selectedModel={selectedModel}
                    onAgentChange={setSelectedAgent}
                    onModelChange={setSelectedModel}
                    onClose={onClose}
                    onRefresh={effectiveOnRefresh}
                    voiceConfig={voiceConfig}
                    onVoiceConfigChange={updateConfig}
                    availableVoices={availableVoices}
                    selectedVoice={selectedVoice}
                    onVoiceChange={setSelectedVoice}
                    autoSpeak={autoSpeak}
                    onAutoSpeakChange={setAutoSpeak}
                    isMaximized={isMaximized}
                    onMaximize={allowMaximize ? toggleMaximize : undefined}
                    title={headerTitle}
                    titleUrl={headerTitleUrl}
                    subtitle={headerSubtitle}
                    avatar={avatar}
                    onHistory={() => {
                        setIsHistoryOpen(true)
                        fetchThreads()
                    }}
                />
            )}
            <div className="flex-1 overflow-hidden relative">
                <MemoizedChat
                    messages={messages}
                    handleSubmit={handleSubmit}
                    input={input}
                    handleInputChange={handleInputChange}
                    stop={handleStop}
                    isGenerating={isGenerating}
                    append={handleAppend}
                    suggestions={suggestions}
                    onRateResponse={handleRateResponse}
                    setMessages={setMessages}
                    placeholder={placeholder}
                    voiceConfig={voiceConfig}
                    isListening={isListening}
                    startListening={startListening}
                    stopListening={stopListening}
                    isSpeechSupported={isRecognitionSupported}
                />

                <AnimatePresence>
                    {isHistoryOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsHistoryOpen(false)}
                                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20"
                            />
                            <motion.div
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="absolute top-0 right-0 bottom-0 w-80 bg-background border-l shadow-2xl z-30 flex flex-col"
                            >
                                <div className="p-4 border-b flex items-center justify-between">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <HistoryIcon size={18} className="text-primary" />
                                        Chat History
                                    </h3>
                                    <Button variant="ghost" size="icon" onClick={() => setIsHistoryOpen(false)} className="h-8 w-8 rounded-full">
                                        <X size={16} />
                                    </Button>
                                </div>
                                <div className="p-3">
                                    <Button
                                        onClick={startNewChat}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl h-10 shadow-sm"
                                        variant="outline"
                                    >
                                        <Plus size={16} />
                                        New Conversation
                                    </Button>
                                </div>
                                <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 custom-scrollbar">
                                    {isThreadsLoading ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                                            <Loader2 className="animate-spin text-primary" size={24} />
                                            <span className="text-sm font-medium">Loading chats...</span>
                                        </div>
                                    ) : threads.length === 0 ? (
                                        <div className="text-center py-20 text-muted-foreground">
                                            <MessageSquare className="mx-auto mb-3 opacity-20" size={40} />
                                            <p className="text-sm">No recent conversations</p>
                                        </div>
                                    ) : (
                                        threads.map((t) => (
                                            <button
                                                key={t.thread_id}
                                                onClick={() => handleLoadThread(t.thread_id)}
                                                className={cn(
                                                    "w-full p-3.5 rounded-xl text-left transition-all duration-200 group flex flex-col gap-1.5",
                                                    currentThreadId === t.thread_id
                                                        ? "bg-primary/5 border-primary/20 border shadow-sm ring-1 ring-primary/10"
                                                        : "hover:bg-muted border border-transparent"
                                                )}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className={cn(
                                                        "text-sm font-semibold truncate max-w-[180px]",
                                                        currentThreadId === t.thread_id ? "text-primary" : "text-foreground/80 group-hover:text-foreground"
                                                    )}>
                                                        Thread {t.thread_id.slice(-6)}
                                                    </span>
                                                    <ChevronRight size={14} className={cn(
                                                        "text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary",
                                                        currentThreadId === t.thread_id && "text-primary/60"
                                                    )} />
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                                                    <Calendar size={12} className="opacity-70" />
                                                    {new Date(t.updated_at).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
            {showFooter && <Footer disclaimer={footerContent} subtitle={footerSubtitle} />}
        </div>
    )
}
