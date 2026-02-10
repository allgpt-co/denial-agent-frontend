/**
 * TypeScript types matching the backend schema
 */
export interface ToolCall {
    name: string;
    args: Record<string, any>;
    id: string | null;
    type?: 'tool_call';
}
export type MessageType = 'human' | 'ai' | 'tool' | 'custom';
export interface ChatMessage {
    type: MessageType;
    content: string;
    tool_calls?: ToolCall[];
    tool_call_id?: string | null;
    run_id?: string | null;
    response_metadata?: Record<string, any>;
    custom_data?: Record<string, any>;
    id?: string | null;
    suggestions?: string[];
}
export interface AgentInfo {
    key: string;
    description: string;
    suggestions?: string[];
}
export interface ServiceMetadata {
    agents: AgentInfo[];
    models: string[];
    default_agent: string;
    default_model: string;
}
export interface ThreadConfig {
    thread_id?: string | null;
    user_id?: string | null;
}
export interface FileAttachment {
    file_id: string;
    filename: string;
    content_type: string;
    size: number;
}
export interface UserInput extends ThreadConfig {
    message: string;
    model?: string | null;
    agent_config?: Record<string, any>;
    attachments?: FileAttachment[];
}
export interface StreamInput extends UserInput {
    stream_tokens?: boolean;
}
export interface ChatHistoryInput {
    thread_id?: string | null;
    user_id?: string | null;
}
export interface ChatHistory {
    messages: ChatMessage[];
}
export interface Feedback {
    run_id: string;
    key: string;
    score: number;
    kwargs?: Record<string, any>;
}
export type StreamEventType = 'message' | 'token' | 'error' | 'update';
export interface StreamEventMessage {
    type: 'message';
    content: ChatMessage;
}
export interface StreamEventToken {
    type: 'token';
    content: string;
}
export interface StreamEventError {
    type: 'error';
    content: string;
}
export interface StreamEventUpdate {
    type: 'update';
    node: string;
    updates: Record<string, any>;
}
export type StreamEvent = StreamEventMessage | StreamEventToken | StreamEventError | StreamEventUpdate;
export interface Thread {
    thread_id: string;
    title?: string;
    updated_at?: string;
    created_at?: string;
    metadata?: Record<string, any>;
}
//# sourceMappingURL=types.d.ts.map