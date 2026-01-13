import { type ChatMessageProps, type Message } from "@/components/ui/chat-message";
type AdditionalMessageOptions = Omit<ChatMessageProps, keyof Message>;
interface MessageListProps {
    messages: Message[];
    showTimeStamps?: boolean;
    isTyping?: boolean;
    messageOptions?: AdditionalMessageOptions | ((message: Message) => AdditionalMessageOptions);
}
export declare function MessageList({ messages, showTimeStamps, isTyping, messageOptions, }: MessageListProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=message-list.d.ts.map