import React from "react";
import { type VariantProps } from "class-variance-authority";
declare const chatBubbleVariants: (props?: ({
    variant?: "tool" | "user" | "assistant" | "subagent" | null | undefined;
    animation?: "none" | "scale" | "slide" | "fade" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
type Animation = VariantProps<typeof chatBubbleVariants>["animation"];
interface Attachment {
    name?: string;
    contentType?: string;
    url: string;
}
interface PartialToolCall {
    state: "partial-call";
    toolName: string;
}
interface ToolCall {
    state: "call";
    toolName: string;
}
interface ToolResult {
    state: "result";
    toolName: string;
    result: {
        __cancelled?: boolean;
        [key: string]: any;
    };
}
type ToolInvocation = PartialToolCall | ToolCall | ToolResult;
interface ReasoningPart {
    type: "reasoning";
    reasoning: string;
}
interface ToolInvocationPart {
    type: "tool-invocation";
    toolInvocation: ToolInvocation;
}
interface TextPart {
    type: "text";
    text: string;
}
interface SourcePart {
    type: "source";
    source?: any;
}
interface FilePart {
    type: "file";
    mimeType: string;
    data: string;
}
interface StepStartPart {
    type: "step-start";
}
type MessagePart = TextPart | ReasoningPart | ToolInvocationPart | SourcePart | FilePart | StepStartPart;
export interface Message {
    id: string;
    role: "user" | "assistant" | (string & {});
    content: string;
    name?: string;
    createdAt?: Date;
    experimental_attachments?: Attachment[];
    toolInvocations?: ToolInvocation[];
    parts?: MessagePart[];
}
export interface ChatMessageProps extends Message {
    showTimeStamp?: boolean;
    animation?: Animation;
    actions?: React.ReactNode;
}
export declare const ChatMessage: React.FC<ChatMessageProps>;
declare function ToolCall({ toolInvocations, }: Pick<ChatMessageProps, "toolInvocations">): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=chat-message.d.ts.map