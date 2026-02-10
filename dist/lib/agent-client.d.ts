import type { ChatHistory, ChatHistoryInput, ChatMessage, Feedback, FileAttachment, ServiceMetadata, StreamInput, UserInput, StreamEventUpdate } from './types';
export declare class AgentClientError extends Error {
    constructor(message: string);
}
export interface AgentClientOptions {
    baseUrl: string;
    agent?: string | null;
    timeout?: number;
    authSecret?: string;
    getInfo?: boolean;
}
/**
 * Client for interacting with the agent service.
 * TypeScript equivalent of the Python AgentClient.
 */
export declare class AgentClient {
    private baseUrl;
    private authSecret?;
    private timeout?;
    private _info;
    private _agent;
    private _initPromise;
    constructor(options: AgentClientOptions);
    private get headers();
    get agent(): string | null;
    get info(): ServiceMetadata | null;
    retrieveInfo(): Promise<void>;
    updateAgent(agent: string, skipVerify?: boolean): void;
    invoke(input: Omit<UserInput, 'agent'>): Promise<ChatMessage>;
    private parseStreamLine;
    stream(input: Omit<StreamInput, 'agent'>): AsyncGenerator<ChatMessage | string | StreamEventUpdate, void, unknown>;
    createFeedback(feedback: Feedback): Promise<void>;
    getHistory(input: ChatHistoryInput): Promise<ChatHistory>;
    listThreads(limit?: number, offset?: number, userId?: string | null): Promise<import('./types').Thread[]>;
    uploadFile(file: File): Promise<FileAttachment>;
    uploadFiles(files: File[]): Promise<FileAttachment[]>;
}
//# sourceMappingURL=agent-client.d.ts.map