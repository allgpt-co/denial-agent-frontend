import { useState, useEffect, useCallback, useRef, useMemo } from "react"

export interface AgentInfo {
    key: string
    description: string
}

export interface ServiceMetadata {
    agents: AgentInfo[]
    models: string[]
    default_agent: string
    default_model: string
}

export interface ChatMessage {
    type: "human" | "ai" | "tool" | "custom"
    name?: string
    content: string
    tool_calls?: Array<{
        name: string
        args: Record<string, any>
        id?: string
    }>
    tool_call_id?: string
    run_id?: string
    response_metadata?: Record<string, any>
    custom_data?: Record<string, any>
}

export interface Thread {
    thread_id: string
    user_id: string
    updated_at: string
}

export interface StreamEvent {
    type: "message" | "token" | "error" | "update" | "done"
    content?: ChatMessage | string | Record<string, any>
    node?: string
    updates?: Record<string, any>
}

export interface ChatbotApiOptions {
    url: string
    agent?: string
    model?: string
    threadId?: string
    userId?: string
    stream?: boolean
}

// Global cache for metadata to prevent redundant fetches across component instances
const metadataCache = new Map<string, {
    data: ServiceMetadata
    timestamp: number
    promise?: Promise<ServiceMetadata>
}>()

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes cache TTL

function getCachedMetadata(url: string): ServiceMetadata | null {
    const cached = metadataCache.get(url)
    if (cached && cached.data && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data
    }
    return null
}

function setCachedMetadata(url: string, data: ServiceMetadata): void {
    metadataCache.set(url, { data, timestamp: Date.now() })
}

// Utility function to clear the metadata cache (useful for testing or logout)
export function clearMetadataCache(): void {
    metadataCache.clear()
}

export function useChatbotApi({
    url,
    agent: optionsAgent,
    model: optionsModel,
    threadId,
    userId,
    stream: optionsStream,
}: ChatbotApiOptions) {
    // Initialize from cache if available
    const [metadata, setMetadata] = useState<ServiceMetadata | null>(() => getCachedMetadata(url))
    const [loading, setLoading] = useState(!getCachedMetadata(url))
    const [error, setError] = useState<string | null>(null)
    const abortControllerRef = useRef<AbortController | null>(null)
    const isMountedRef = useRef(true)

    const fetchMetadata = useCallback(async (force = false) => {
        // Check cache first unless forced
        if (!force) {
            const cached = getCachedMetadata(url)
            if (cached) {
                setMetadata(cached)
                setLoading(false)
                return
            }
        }

        // Check if there's already a pending request for this URL
        const existing = metadataCache.get(url)
        if (existing?.promise) {
            try {
                const data = await existing.promise
                if (isMountedRef.current) {
                    setMetadata(data)
                    setLoading(false)
                }
                return
            } catch {
                // If the pending promise failed, continue with a new request
            }
        }

        // Create a new request promise
        const fetchPromise = (async () => {
            const response = await fetch(`${url}/info`)
            if (!response.ok) {
                throw new Error(`Failed to fetch metadata: ${response.statusText}`)
            }
            return await response.json()
        })()

        // Store the promise to dedupe concurrent requests
        metadataCache.set(url, { ...metadataCache.get(url)!, promise: fetchPromise, timestamp: 0, data: null as any })

        try {
            setLoading(true)
            setError(null)
            const data = await fetchPromise
            setCachedMetadata(url, data)
            if (isMountedRef.current) {
                setMetadata(data)
            }
        } catch (err) {
            if (isMountedRef.current) {
                setError(err instanceof Error ? err.message : "Failed to fetch metadata")
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false)
            }
        }
    }, [url])

    // Fetch metadata only once on mount or when URL changes
    useEffect(() => {
        isMountedRef.current = true

        // Only fetch if no cached data
        if (!getCachedMetadata(url)) {
            fetchMetadata()
        }

        return () => {
            isMountedRef.current = false
        }
    }, [url, fetchMetadata])

    const streamMessage = useCallback(
        async function* (
            message: string,
            onUpdate?: (event: StreamEvent) => void
        ): AsyncGenerator<StreamEvent, void, unknown> {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
            abortControllerRef.current = new AbortController()

            const agent = optionsAgent || metadata?.default_agent || "portfolio-agent"
            const endpoint = `${url}/${agent}/stream`

            const requestBody = {
                message,
                ...((optionsModel || metadata?.default_model) && {
                    model: optionsModel || metadata?.default_model,
                }),
                ...(threadId && { thread_id: threadId }),
                ...(userId && { user_id: userId }),
                stream_tokens: optionsStream ?? true,
            }

            try {
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestBody),
                    signal: abortControllerRef.current.signal,
                })

                if (!response.ok) {
                    let errorMessage = `Stream failed: ${response.statusText}`
                    try {
                        const errorData = await response.json()
                        if (errorData.detail) {
                            if (Array.isArray(errorData.detail)) {
                                errorMessage = `Stream failed: ${errorData.detail
                                    .map((err: any) =>
                                        typeof err === "object" && err.msg
                                            ? `${err.loc?.join(".") || "field"}: ${err.msg}`
                                            : JSON.stringify(err)
                                    )
                                    .join(", ")}`
                            } else {
                                errorMessage = `Stream failed: ${typeof errorData.detail === "string"
                                    ? errorData.detail
                                    : JSON.stringify(errorData.detail)
                                    }`
                            }
                        }
                    } catch {
                        /* ignore JSON parse error */
                    }
                    throw new Error(errorMessage)
                }

                const reader = response.body?.getReader()
                if (!reader) throw new Error("No response body")

                const decoder = new TextDecoder()
                let buffer = ""

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    buffer += decoder.decode(value, { stream: true })
                    const lines = buffer.split("\n\n")
                    buffer = lines.pop() || ""

                    for (const line of lines) {
                        if (!line.startsWith("data: ")) continue
                        const data = line.slice(6)

                        if (data === "[DONE]") {
                            const doneEvent: StreamEvent = { type: "done" }
                            yield doneEvent
                            onUpdate?.(doneEvent)
                            return
                        }

                        try {
                            const parsed = JSON.parse(data)
                            let event: StreamEvent | null = null

                            if (parsed.type === "message") {
                                event = { type: "message", content: parsed.content as ChatMessage }
                            } else if (parsed.type === "token") {
                                event = { type: "token", content: parsed.content as string }
                            } else if (parsed.type === "error") {
                                event = { type: "error", content: parsed.content as string }
                            } else if (parsed.type === "update" || parsed.node) {
                                event = {
                                    type: "update",
                                    node: parsed.node,
                                    updates: parsed.updates || {},
                                    content: parsed.updates || parsed,
                                }
                            }

                            if (event) {
                                yield event
                                onUpdate?.(event)
                            }
                        } catch (e) {
                            console.error("Error parsing SSE data:", e)
                        }
                    }
                }
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") return
                const errorEvent: StreamEvent = {
                    type: "error",
                    content: err instanceof Error ? err.message : "Stream error",
                }
                yield errorEvent
                onUpdate?.(errorEvent)
            }
        },
        [url, optionsAgent, optionsModel, threadId, userId, optionsStream, metadata]
    )

    const stopStream = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
    }, [])

    const sendFeedback = useCallback(
        async (runId: string, key: string, score: number) => {
            try {
                const response = await fetch(`${url}/feedback`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ run_id: runId, key, score }),
                })
                if (!response.ok) {
                    throw new Error(`Failed to send feedback: ${response.statusText}`)
                }
                return await response.json()
            } catch (err) {
                console.error("Error sending feedback:", err)
                throw err
            }
        },
        [url]
    )

    const getHistory = useCallback(
        async (threadId: string) => {
            try {
                const response = await fetch(`${url}/history`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ thread_id: threadId }),
                })
                if (!response.ok) {
                    throw new Error(`Failed to get history: ${response.statusText}`)
                }
                const data = await response.json()
                return data.messages as ChatMessage[]
            } catch (err) {
                console.error("Error getting history:", err)
                throw err
            }
        },
        [url]
    )

    const listThreads = useCallback(
        async (limit: number = 20, offset: number = 0) => {
            try {
                const queryParams = new URLSearchParams({
                    limit: limit.toString(),
                    offset: offset.toString(),
                })
                if (userId) {
                    queryParams.append("user_id", userId)
                }
                const response = await fetch(`${url}/threads?${queryParams.toString()}`)
                if (!response.ok) {
                    throw new Error(`Failed to list threads: ${response.statusText}`)
                }
                return await response.json() as Thread[]
            } catch (err) {
                console.error("Error listing threads:", err)
                throw err
            }
        },
        [url, userId]
    )

    return useMemo(() => ({
        metadata,
        loading,
        error,
        streamMessage,
        stopStream,
        sendFeedback,
        getHistory,
        listThreads,
        refetchMetadata: () => fetchMetadata(true),
    }), [metadata, loading, error, streamMessage, stopStream, sendFeedback, getHistory, listThreads, fetchMetadata])
}
