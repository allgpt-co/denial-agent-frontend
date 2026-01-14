import { useEffect, useState, useCallback, useRef } from 'react'
import { AgentClient } from '@/lib/agent-client'
import { useVoice } from '@/hooks/use-voice'
import { Chat } from '@/components/ui/chat'
import type { Message } from '@/components/ui/chat-message'
import { cn } from '@/lib/utils'
import type { Thread, ChatMessage as AgentChatMessage, StreamEventUpdate } from '@/lib/types'
import { ChatHeader } from './chat/ChatHeader'
import { extractSuggestions } from '@/lib/chat-utils'

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
    setInput?: (value: string | ((prev: string) => string)) => void
    threadId?: string
    onExpand?: () => void
    isExpanded?: boolean
    onClose?: () => void
}

export function AgentChat({
    baseUrl,
    agent: initialAgent = 'default',
    userId = undefined,
    enableStreaming = true,
    suggestions = [],
    onError = undefined,
    onRateResponse = undefined,
    className = undefined,
    showSettings = true,
    showHeader = true,
    placeholder = '',
    direction = 'right',
    input: propInput = undefined,
    setInput: propSetInput = undefined,
    model: initialModel = undefined,
    threadId = undefined,
    onExpand = undefined,
    isExpanded = false,
    onClose = undefined,
}: AgentChatProps) {
    // State for Configuration
    const [currentAgent, setCurrentAgent] = useState<string>(initialAgent)
    const [currentModel, setCurrentModel] = useState<string>(initialModel || '')

    // State for Chat
    const [messages, setMessages] = useState<Message[]>([])
    const [internalInput, setInternalInput] = useState('')

    const input = propInput ?? internalInput
    const setInput = useCallback((value: string | ((prev: string) => string)) => {
        if (propInput === undefined) setInternalInput(value)
        if (propSetInput) {
            const newValue = typeof value === 'function' ? value(input) : value
            propSetInput(newValue)
        }
    }, [propInput, propSetInput, input])
    const [isGenerating, setIsGenerating] = useState(false)
    const [followupSuggestions, setFollowupSuggestions] = useState<string[]>([])

    // State for Client
    const [client, setClient] = useState<AgentClient | null>(null)
    const [availableAgents, setAvailableAgents] = useState<{ key: string; description: string; suggestions?: string[] }[]>([])
    const [availableModels, setAvailableModels] = useState<string[]>([])

    // State for UI Toggles
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)

    // State for History
    const [threads, setThreads] = useState<Thread[]>([])
    const [currentThreadId, setCurrentThreadId] = useState<string | null>(threadId || null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const createWelcomeMessage = useCallback((agentKey: string) => {
        if (!client?.info?.agents) return
        const agentInfo = client.info.agents.find(a => a.key === agentKey)

        // Instead of adding a message, we just clear messages to let PromptSuggestions show
        setMessages([])

        const initialSugs = agentInfo?.suggestions?.length ? agentInfo.suggestions : (suggestions?.length ? suggestions : [])
        setFollowupSuggestions(initialSugs)
    }, [client?.info?.agents, suggestions])

    // Load thread history when threadId prop changes
    useEffect(() => {
        if (threadId) {
            setCurrentThreadId(threadId)
            if (client) {
                loadThread(threadId)
            }
        }
    }, [threadId, client])

    // Initialize Client
    useEffect(() => {
        const initClient = async () => {
            try {
                // If the agent is 'default', let the client pick the backend default
                const agentToUse = currentAgent === 'default' ? null : currentAgent

                const newClient = new AgentClient({
                    baseUrl,
                    agent: agentToUse,
                    getInfo: true,
                })

                await newClient.retrieveInfo()
                setClient(newClient)

                if (newClient.info) {
                    setAvailableAgents(newClient.info.agents)
                    setAvailableModels(newClient.info.models)

                    // Sync currentAgent with whatever the client decided (e.g. if 'default' was used)
                    if (newClient.agent) {
                        setCurrentAgent(newClient.agent)
                    }

                    if (!currentModel) {
                        setCurrentModel(newClient.info.default_model)
                    }

                    if (messages.length === 0 && newClient.agent) {
                        createWelcomeMessage(newClient.agent)
                    }
                }
            } catch (err) {
                if (err instanceof Error) onError?.(err)
            }
        }

        initClient()
    }, [baseUrl]) // Only re-init if baseUrl changes

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
            const history = await client.getHistory({ 
                thread_id: threadId,
                user_id: userId || undefined
            })
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
        setIsRefreshing(true)
        setTimeout(() => setIsRefreshing(false), 1000)

        if (client?.agent) {
            createWelcomeMessage(client.agent)
        } else {
            setMessages([])
            setFollowupSuggestions(suggestions || [])
        }
        setCurrentThreadId(null)
        setInput('')
        setIsHistoryOpen(false)
    }

    // Unified Send Message Logic
    const handleSendMessage = async (content: string) => {
        if (!content.trim() || !client) return

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content,
            createdAt: new Date(),
        }

        setMessages((prev) => [...prev, userMsg])
        setInput('')
        setFollowupSuggestions([])
        setIsGenerating(true)

        const tId = currentThreadId || crypto.randomUUID()
        if (!currentThreadId) setCurrentThreadId(tId)

        const threadConfig = { thread_id: tId, user_id: userId }

        try {
            if (enableStreaming) {
                const stream = client.stream({
                    message: content,
                    model: currentModel || undefined,
                    ...threadConfig
                })

                let currentMessageId: string | null = null

                for await (const chunk of stream) {
                    if (typeof chunk === 'string') {
                        updateAssistantMessage(chunk, currentMessageId, (id) => currentMessageId = id)
                    } else if (typeof chunk === 'object' && chunk !== null) {
                        if ('type' in chunk && (chunk as any).type === 'update') {
                            const update = chunk as StreamEventUpdate
                            const suggestions = update.updates.follow_up || update.updates.next_step_suggestions
                            if (suggestions) setFollowupSuggestions(suggestions)
                            continue
                        }

                        const msg = chunk as AgentChatMessage
                        if (msg.tool_calls?.length) {
                            const isSubAgent = msg.tool_calls.some(tc => tc.name.includes('sub-agent'))
                            currentMessageId = null
                            setMessages(prev => [...prev, {
                                id: crypto.randomUUID(),
                                role: (isSubAgent ? 'subagent' : 'tool') as any,
                                content: msg.content || '',
                                toolInvocations: msg.tool_calls!.map(tc => ({
                                    state: 'call' as const,
                                    toolName: tc.name,
                                    toolCallId: tc.id || crypto.randomUUID()
                                })),
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
                            updateAssistantMessage(msg.content, currentMessageId, (id) => currentMessageId = id)
                        }
                    }
                }

                // Final suggestion extraction
                setMessages(prev => {
                    const lastMsg = prev[prev.length - 1]
                    if (lastMsg?.role === 'assistant') {
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
                    message: content,
                    model: currentModel || undefined,
                    ...threadConfig
                })

                const { suggestions: extracted, cleanContent } = extractSuggestions(response.content || '')
                setFollowupSuggestions(response.suggestions?.length ? response.suggestions : extracted)

                setMessages((prev) => [...prev, {
                    id: response.id || crypto.randomUUID(),
                    role: 'assistant',
                    content: cleanContent,
                    createdAt: new Date()
                }])
            }
        } catch (err) {
            if (err instanceof Error) onError?.(err)
            setMessages((prev) => [...prev, {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: 'Error processing request. Please try again.',
                createdAt: new Date()
            }])
        } finally {
            setIsGenerating(false)
            fetchHistory()
        }
    }

    const updateAssistantMessage = useCallback((content: string, existingId: string | null, setId: (id: string) => void) => {
        setMessages((prev) => {
            const lastMsg = prev[prev.length - 1]
            if (existingId && lastMsg && lastMsg.id === existingId && lastMsg.role === 'assistant' && !lastMsg.toolInvocations) {
                return prev.map(m => m.id === existingId ? { ...m, content: m.content + content } : m)
            } else {
                const newId = crypto.randomUUID()
                setId(newId)
                return [...prev, { id: newId, role: 'assistant', content, createdAt: new Date() }]
            }
        })
    }, [])

    // Handle Send Message
    const handleSubmit = async (event?: { preventDefault?: () => void }) => {
        event?.preventDefault?.()
        handleSendMessage(input)
    }

    // Handle Input Change
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
    }

    // Voice Support
    const [autoSpeak, setAutoSpeak] = useState(false)
    const {
        isListening,
        isSpeaking,
        startListening,
        stopListening,
        speak,
        stopSpeaking,
        voiceConfig,
        updateConfig,
        availableVoices,
        selectedVoice,
        setSelectedVoice,
        isRecognitionSupported,
    } = useVoice({
        onTranscript: (text, isFinal) => {
            if (isFinal) {
                // If final, append with space if needed
                setInput((prev) => {
                    const separator = prev && !prev.endsWith(' ') ? ' ' : ''
                    return prev + separator + text
                })
            }
        },
    })

    // Auto-speak responses
    const prevIsGenerating = useRef(isGenerating)

    useEffect(() => {
        if (prevIsGenerating.current && !isGenerating && autoSpeak) {
            const lastMsg = messages[messages.length - 1]
            if (lastMsg?.role === 'assistant' && lastMsg.content) {
                speak(lastMsg.content)
            }
        }
        prevIsGenerating.current = isGenerating
    }, [isGenerating, autoSpeak, messages, speak])

    return (
        <div className="chat-theme h-full w-full">
            <div className={cn("flex h-full w-full flex-col overflow-hidden", className)}>
                {/* Header / Settings Bar */}
                {showHeader && (
                    <ChatHeader
                        currentAgent={currentAgent}
                        isRefreshing={isRefreshing}
                        onNewChat={handleNewChat}
                        isHistoryOpen={isHistoryOpen}
                        onHistoryOpenChange={setIsHistoryOpen}
                        threads={threads}
                        currentThreadId={currentThreadId}
                        onSelectThread={loadThread}
                        onFetchHistory={fetchHistory}
                        direction={direction}
                        showSettings={showSettings}
                        availableAgents={availableAgents}
                        onAgentChange={setCurrentAgent}
                        currentModel={currentModel}
                        onModelChange={setCurrentModel}
                        availableModels={availableModels}
                        voiceConfig={voiceConfig}
                        onVoiceConfigChange={updateConfig}
                        availableVoices={availableVoices}
                        selectedVoice={selectedVoice}
                        onVoiceChange={setSelectedVoice}
                        autoSpeak={autoSpeak}
                        onAutoSpeakChange={setAutoSpeak}
                        onExpand={onExpand}
                        isExpanded={isExpanded}
                        onClose={onClose}
                    />
                )}

                {/* Main Chat Area */}
                <div className="flex-1 overflow-hidden relative bg-background flex flex-col">
                    <Chat
                        messages={messages}
                        handleSubmit={handleSubmit}
                        input={input}
                        handleInputChange={handleInputChange}
                        isGenerating={isGenerating}
                        append={(msg) => handleSendMessage(msg.content)}
                        suggestions={followupSuggestions.length > 0 ? followupSuggestions : (messages.length === 0 ? suggestions : [])}
                        onRateResponse={onRateResponse}
                        placeholder={placeholder}
                        isListening={isListening}
                        startListening={startListening}
                        stopListening={stopListening}
                        isSpeechSupported={isRecognitionSupported}
                        speak={speak}
                        stopSpeaking={stopSpeaking}
                        isSpeaking={isSpeaking}
                        label={client?.info?.agents?.find(a => a.key === currentAgent)?.description}
                        className="flex-1"
                    />
                </div>
            </div>
        </div>
    )
}
