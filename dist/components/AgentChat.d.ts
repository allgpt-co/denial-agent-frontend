export interface AgentChatProps {
    baseUrl: string;
    agent?: string;
    model?: string;
    userId?: string;
    placeholder?: string;
    enableStreaming?: boolean;
    suggestions?: string[];
    onError?: (error: Error) => void;
    onRateResponse?: (messageId: string, rating: 'thumbs-up' | 'thumbs-down') => void;
    className?: string;
    showSettings?: boolean;
    showHeader?: boolean;
    direction?: 'left' | 'right' | 'top' | 'bottom';
    input?: string;
    setInput?: (value: string) => void;
    threadId?: string;
}
export declare function AgentChat({ baseUrl, agent: initialAgent, userId, enableStreaming, suggestions, onError, onRateResponse, className, showSettings, showHeader, placeholder, direction, input: propInput, setInput: propSetInput, model: initialModel, threadId, }: AgentChatProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=AgentChat.d.ts.map