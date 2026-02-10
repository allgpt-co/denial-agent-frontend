/**
 * @package @quickintell/agent-chat
 * A reusable React library for building chat interfaces with AI agents.
 * When using as a module, import styles separately: import '@quickintell/agent-chat/index.css'
 */
export { AgentChat } from './components/AgentChat';
export { AgentChat as FullChatbot } from './components/AgentChat';
export { AgentChat as Chatbot } from './components/AgentChat';
export { PopupChatbot } from './components/PopupChatbot';
export type { PopupChatbotProps } from './components/PopupChatbot';
export type { AgentChatProps } from './components/AgentChat';
export { AgentClient, AgentClientError } from './lib/agent-client';
export type { ChatMessage, AgentInfo, ServiceMetadata, ThreadConfig, ToolCall, UserInput, StreamInput, ChatHistory, ChatHistoryInput, Feedback, StreamEvent, } from './lib/types';
export { Chat, ChatContainer, ChatForm, ChatMessages } from './components/ui/chat';
export { ChatMessage as ChatMessageComponent } from './components/ui/chat-message';
export type { Message, ChatMessageProps } from './components/ui/chat-message';
export { MessageInput } from './components/ui/message-input';
export { MessageList } from './components/ui/message-list';
export { PromptSuggestions } from './components/ui/prompt-suggestions';
export { Button } from './components/ui/button';
export { CopyButton } from './components/ui/copy-button';
export { MarkdownRenderer } from './components/ui/markdown-renderer';
export { cn } from './lib/utils';
//# sourceMappingURL=index.d.ts.map