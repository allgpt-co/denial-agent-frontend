import type {
    ChatHistory,
    ChatHistoryInput,
    ChatMessage,
    Feedback,
    ServiceMetadata,
    StreamEvent,
    StreamInput,
    UserInput,
} from './types'

export class AgentClientError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'AgentClientError'
    }
}

export interface AgentClientOptions {
    baseUrl: string
    agent?: string | null
    timeout?: number
    authSecret?: string
    getInfo?: boolean
}

/**
 * Client for interacting with the agent service.
 * TypeScript equivalent of the Python AgentClient.
 */
export class AgentClient {
    private baseUrl: string
    private authSecret?: string
    private timeout?: number
    private _info: ServiceMetadata | null = null
    private _agent: string | null = null
    private _initPromise: Promise<void> | null = null

    constructor(options: AgentClientOptions) {
        const {
            baseUrl,
            agent,
            timeout,
            authSecret,
            getInfo = true,
        } = options

        this.baseUrl = baseUrl
        this.authSecret = authSecret
        this.timeout = timeout

        if (getInfo) {
            // Fetch service info and then update agent if provided
            this._initPromise = this.retrieveInfo()
                .then(() => {
                    if (agent) {
                        this.updateAgent(agent, false)
                    }
                })
                .catch((error) => {
                    console.error('Error fetching service info:', error)
                })
        } else if (agent) {
            // If not fetching info, update agent without verification
            this.updateAgent(agent, true)
        }
    }

    private get headers(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }
        if (this.authSecret) {
            headers['Authorization'] = `Bearer ${this.authSecret}`
        }
        return headers
    }

    get agent(): string | null {
        return this._agent
    }

    get info(): ServiceMetadata | null {
        return this._info
    }

    async retrieveInfo(): Promise<void> {
        try {
            const controller = new AbortController()
            const timeoutId = this.timeout
                ? setTimeout(() => controller.abort(), this.timeout)
                : undefined

            const response = await fetch(`${this.baseUrl}/info`, {
                headers: this.headers,
                signal: controller.signal,
            })

            if (timeoutId) clearTimeout(timeoutId)

            if (!response.ok) {
                throw new AgentClientError(`HTTP error! status: ${response.status}`)
            }

            this._info = await response.json()

            if (!this._agent || !this._info?.agents.some((a) => a.key === this._agent)) {
                this._agent = this._info?.default_agent || null
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new AgentClientError(`Error getting service info: ${error.message}`)
            }
            throw error
        }
    }

    updateAgent(agent: string, skipVerify = false): void {
        if (!skipVerify) {
            if (!this._info) {
                throw new AgentClientError(
                    'Service info not loaded. Call retrieveInfo() first or set getInfo to true in constructor.'
                )
            }
            const agentKeys = this._info.agents.map((a) => a.key)
            if (!agentKeys.includes(agent)) {
                throw new AgentClientError(
                    `Agent ${agent} not found in available agents: ${agentKeys.join(', ')}`
                )
            }
        }
        this._agent = agent
    }

    async invoke(input: Omit<UserInput, 'agent'>): Promise<ChatMessage> {
        if (this._initPromise) {
            await this._initPromise
        }

        if (!this._agent) {
            throw new AgentClientError('No agent selected. Use updateAgent() to select an agent.')
        }

        try {
            const controller = new AbortController()
            const timeoutId = this.timeout
                ? setTimeout(() => controller.abort(), this.timeout)
                : undefined

            const response = await fetch(`${this.baseUrl}/${this._agent}/invoke`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(input),
                signal: controller.signal,
            })

            if (timeoutId) clearTimeout(timeoutId)

            if (!response.ok) {
                throw new AgentClientError(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            if (error instanceof Error) {
                throw new AgentClientError(`Error invoking agent: ${error.message}`)
            }
            throw error
        }
    }

    private parseStreamLine(line: string): ChatMessage | string | null {
        const trimmed = line.trim()
        if (trimmed.startsWith('data: ')) {
            const data = trimmed.substring(6)
            if (data === '[DONE]') {
                return null
            }
            try {
                const parsed: StreamEvent = JSON.parse(data)
                switch (parsed.type) {
                    case 'message':
                        return parsed.content
                    case 'token':
                        return parsed.content
                    case 'error':
                        return {
                            type: 'ai',
                            content: `Error: ${parsed.content}`,
                        } as ChatMessage
                    default:
                        return null
                }
            } catch (error) {
                console.error('Error parsing stream event:', error)
                return null
            }
        }
        return null
    }

    async *stream(
        input: Omit<StreamInput, 'agent'>
    ): AsyncGenerator<ChatMessage | string, void, unknown> {
        if (this._initPromise) {
            await this._initPromise
        }

        if (!this._agent) {
            throw new AgentClientError('No agent selected. Use updateAgent() to select an agent.')
        }

        const streamInput: StreamInput = {
            ...input,
            stream_tokens: input.stream_tokens ?? true,
        }

        try {
            const controller = new AbortController()
            const timeoutId = this.timeout
                ? setTimeout(() => controller.abort(), this.timeout)
                : undefined

            const response = await fetch(`${this.baseUrl}/${this._agent}/stream`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(streamInput),
                signal: controller.signal,
            })

            if (timeoutId) clearTimeout(timeoutId)

            if (!response.ok) {
                throw new AgentClientError(`HTTP error! status: ${response.status}`)
            }

            if (!response.body) {
                throw new AgentClientError('Response body is null')
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            try {
                while (true) {
                    const { done, value } = await reader.read()

                    if (done) break

                    buffer += decoder.decode(value, { stream: true })
                    const lines = buffer.split('\n')
                    buffer = lines.pop() || ''

                    for (const line of lines) {
                        if (line.trim()) {
                            const parsed = this.parseStreamLine(line)
                            if (parsed === null) {
                                return
                            }
                            if (parsed !== '') {
                                yield parsed
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock()
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new AgentClientError(`Error streaming agent response: ${error.message}`)
            }
            throw error
        }
    }

    async createFeedback(feedback: Feedback): Promise<void> {
        try {
            const controller = new AbortController()
            const timeoutId = this.timeout
                ? setTimeout(() => controller.abort(), this.timeout)
                : undefined

            const response = await fetch(`${this.baseUrl}/feedback`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(feedback),
                signal: controller.signal,
            })

            if (timeoutId) clearTimeout(timeoutId)

            if (!response.ok) {
                throw new AgentClientError(`HTTP error! status: ${response.status}`)
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new AgentClientError(`Error creating feedback: ${error.message}`)
            }
            throw error
        }
    }

    async getHistory(input: ChatHistoryInput): Promise<ChatHistory> {
        try {
            const controller = new AbortController()
            const timeoutId = this.timeout
                ? setTimeout(() => controller.abort(), this.timeout)
                : undefined

            const response = await fetch(`${this.baseUrl}/history`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(input),
                signal: controller.signal,
            })

            if (timeoutId) clearTimeout(timeoutId)

            if (!response.ok) {
                throw new AgentClientError(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            if (error instanceof Error) {
                throw new AgentClientError(`Error getting chat history: ${error.message}`)
            }
            throw error
        }
    }

    async listThreads(limit: number = 20, offset: number = 0, userId?: string | null): Promise<import('./types').Thread[]> {
        try {
            const controller = new AbortController()
            const timeoutId = this.timeout
                ? setTimeout(() => controller.abort(), this.timeout)
                : undefined

            const params: Record<string, string> = {
                limit: limit.toString(),
                offset: offset.toString(),
            }
            if (userId) {
                params.user_id = userId
            }

            const queryString = new URLSearchParams(params).toString()

            const response = await fetch(`${this.baseUrl}/threads?${queryString}`, {
                method: 'GET',
                headers: this.headers,
                signal: controller.signal,
            })

            if (timeoutId) clearTimeout(timeoutId)

            if (!response.ok) {
                // Return empty list if endpoint not found to prevent UI crash
                if (response.status === 404) return []
                throw new AgentClientError(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            if (error instanceof Error) {
                throw new AgentClientError(`Error listing threads: ${error.message}`)
            }
            throw error
        }
    }
}
