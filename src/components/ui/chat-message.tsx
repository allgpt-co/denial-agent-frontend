import React, { useMemo, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { Ban, ChevronRight, Code2, Loader2, Terminal, Sparkles, Bot } from "lucide-react"

import { cn } from "@/lib/utils"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { FilePreview } from "@/components/ui/file-preview"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { JsonChip } from "@/components/ui/json-chip"

const chatBubbleVariants = cva(
    "group/message relative break-words rounded-2xl p-4 text-sm sm:max-w-full transition-all duration-300",
    {
        variants: {
            variant: {
                user: "bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground rounded-tr-none shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 [&_a]:text-sky-200 hover:[&_a]:text-sky-100 [&_a]:underline-offset-4 [&_a]:decoration-sky-300/50 [&_blockquote]:border-primary-foreground/30 [&_code]:bg-primary-foreground/10 [&_code]:text-primary-foreground",
                assistant: "bg-card/80 backdrop-blur-md text-card-foreground rounded-tl-none border border-border/40 shadow-sm hover:shadow-md hover:border-primary/20",
                tool: "bg-muted/50 text-muted-foreground rounded-xl border border-border/40 font-mono text-[11px] max-w-full",
                subagent: "bg-gradient-to-br from-indigo-50/90 to-blue-50/90 dark:from-indigo-950/40 dark:to-blue-950/40 text-indigo-900 dark:text-indigo-100 rounded-tl-none border border-indigo-200/50 dark:border-indigo-800/50 shadow-sm",
            },
            animation: {
                none: "",
                slide: "duration-500 animate-in fade-in-0 slide-in-from-bottom-2",
                scale: "duration-300 animate-in fade-in-0 zoom-in-95",
                fade: "duration-500 animate-in fade-in-0",
            },
        },
        compoundVariants: [
            {
                variant: "user",
                animation: "slide",
                class: "slide-in-from-right-4",
            },
            {
                variant: "assistant",
                animation: "slide",
                class: "slide-in-from-left-4",
            },
            {
                variant: "tool",
                animation: "slide",
                class: "slide-in-from-left-4",
            },
            {
                variant: "subagent",
                animation: "slide",
                class: "slide-in-from-left-4",
            },
            {
                variant: "user",
                animation: "scale",
                class: "origin-bottom-right",
            },
            {
                variant: "assistant",
                animation: "scale",
                class: "origin-bottom-left",
            },
            {
                variant: "tool",
                animation: "scale",
                class: "origin-bottom-left",
            },
            {
                variant: "subagent",
                animation: "scale",
                class: "origin-bottom-left",
            },
        ],
    }
)

type Animation = VariantProps<typeof chatBubbleVariants>["animation"]

interface Attachment {
    name?: string
    contentType?: string
    url: string
}

interface PartialToolCall {
    state: "partial-call"
    toolName: string
}

interface ToolCall {
    state: "call"
    toolName: string
}

interface ToolResult {
    state: "result"
    toolName: string
    result: {
        __cancelled?: boolean
        [key: string]: any
    }
}

type ToolInvocation = PartialToolCall | ToolCall | ToolResult

interface ReasoningPart {
    type: "reasoning"
    reasoning: string
}

interface ToolInvocationPart {
    type: "tool-invocation"
    toolInvocation: ToolInvocation
}

interface TextPart {
    type: "text"
    text: string
}

// For compatibility with AI SDK types, not used
interface SourcePart {
    type: "source"
    source?: any
}

interface FilePart {
    type: "file"
    mimeType: string
    data: string
}

interface StepStartPart {
    type: "step-start"
}

type MessagePart =
    | TextPart
    | ReasoningPart
    | ToolInvocationPart
    | SourcePart
    | FilePart
    | StepStartPart

export interface Message {
    id: string
    role: "user" | "assistant" | (string & {})
    content: string
    name?: string
    createdAt?: Date
    experimental_attachments?: Attachment[]
    toolInvocations?: ToolInvocation[]
    parts?: MessagePart[]
}

export interface ChatMessageProps extends Message {
    showTimeStamp?: boolean
    animation?: Animation
    actions?: React.ReactNode
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
    role,
    content,
    createdAt,
    showTimeStamp = false,
    animation = "scale",
    actions,
    name,
    experimental_attachments,
    toolInvocations,
    parts,
}) => {
    const files = useMemo(() => {
        return experimental_attachments?.map((attachment) => {
            const dataArray = dataUrlToUint8Array(attachment.url)
            const file = new File([dataArray], attachment.name ?? "Unknown", {
                type: attachment.contentType,
            })
            return file
        })
    }, [experimental_attachments])

    const isUser = role === "user"
    const variant = role === "user" ? "user"
        : role === "tool" ? "tool"
            : (role === "subagent" || (name && name.startsWith("sub-agent-"))) ? "subagent"
                : "assistant"

    const formattedTime = createdAt?.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    })

    const IconContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => (
        <div className={cn(
            "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border shadow-sm",
            className
        )}>
            {children}
        </div>
    )

    const renderAvatar = () => {
        if (variant === "user") return null
        if (variant === "assistant") {
            return (
                <IconContainer className="bg-gradient-to-tr from-primary to-primary/80 border-primary/20 text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                </IconContainer>
            )
        }
        if (variant === "subagent") {
            return (
                <IconContainer className="bg-gradient-to-tr from-indigo-500 to-blue-500 border-indigo-400/20 text-white">
                    <Bot className="h-4 w-4" />
                </IconContainer>
            )
        }
        return null
    }

    if (!content && !toolInvocations && (!parts || parts.length === 0)) return null

    return (
        <div className={cn(
            "flex w-full gap-3 mb-6",
            isUser ? "flex-row-reverse" : "flex-row"
        )}>
            {renderAvatar()}

            <div className={cn(
                "flex flex-col gap-1.5",
                isUser ? "items-end max-w-[70%]" : "items-start max-w-full"
            )}>
                {/* User Files */}
                {isUser && files && files.length > 0 && (
                    <div className="mb-1 flex flex-wrap gap-2 justify-end">
                        {files.map((file, index) => <FilePreview file={file} key={index} />)}
                    </div>
                )}

                {/* Message Content */}
                <div className={cn(chatBubbleVariants({ variant, animation }))}>
                    {parts && parts.length > 0 ? (
                        parts.map((part, index) => {
                            if (part.type === "text") return <ExpandableMarkdown key={index} variant={variant}>{part.text}</ExpandableMarkdown>
                            if (part.type === "reasoning") return <ReasoningBlock key={index} part={part} />
                            if (part.type === "tool-invocation") return <ToolCall key={index} toolInvocations={[part.toolInvocation]} />
                            return null
                        })
                    ) : toolInvocations && toolInvocations.length > 0 ? (
                        <ToolCall toolInvocations={toolInvocations} />
                    ) : (
                        <ExpandableMarkdown variant={variant}>{content}</ExpandableMarkdown>
                    )}

                    {actions && (
                        <div className="absolute -bottom-4 right-2 flex space-x-1 rounded-lg border bg-background/80 backdrop-blur-sm p-1 text-foreground opacity-0 transition-opacity group-hover/message:opacity-100 shadow-md">
                            {actions}
                        </div>
                    )}
                </div>

                {/* Timestamp */}
                {showTimeStamp && createdAt && (
                    <time
                        dateTime={createdAt.toISOString()}
                        className={cn(
                            "px-1 text-[10px] font-medium text-muted-foreground/50",
                            animation !== "none" && "duration-500 animate-in fade-in-0"
                        )}
                    >
                        {formattedTime}
                    </time>
                )}
            </div>
        </div>
    )
}

const ExpandableMarkdown = ({
    children,
    threshold = 1000,
    variant,
}: {
    children: string
    threshold?: number
    variant: "user" | "assistant" | "tool" | "subagent"
}) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const shouldTruncate = children.length > threshold

    const buttonClass = cn(
        "mt-2 self-start text-xs font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer",
        variant === "user" ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-primary hover:text-primary/80"
    )

    if (!shouldTruncate || isExpanded) {
        return (
            <div className="flex flex-col">
                <MarkdownRenderer>{children}</MarkdownRenderer>
                {shouldTruncate && (
                    <button onClick={() => setIsExpanded(false)} className={buttonClass}>
                        Show less
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            <MarkdownRenderer>
                {children.slice(0, threshold) + "..."}
            </MarkdownRenderer>
            <button onClick={() => setIsExpanded(true)} className={buttonClass}>
                Read more
            </button>
        </div>
    )
}

function dataUrlToUint8Array(data: string) {
    const base64 = data.split(",")[1]
    const binString = atob(base64)
    const len = binString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
        bytes[i] = binString.charCodeAt(i)
    }
    return bytes
}

const ReasoningBlock = ({ part }: { part: ReasoningPart }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="mb-2 flex flex-col items-start sm:max-w-[70%]">
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="group w-full overflow-hidden rounded-lg border bg-muted/50"
            >
                <div className="flex items-center p-2">
                    <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                            <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                            <span>Thinking</span>
                        </button>
                    </CollapsibleTrigger>
                </div>
                <CollapsibleContent forceMount>
                    <motion.div
                        initial={false}
                        animate={isOpen ? "open" : "closed"}
                        variants={{
                            open: { height: "auto", opacity: 1 },
                            closed: { height: 0, opacity: 0 },
                        }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="border-t"
                    >
                        <div className="p-2">
                            <div className="whitespace-pre-wrap text-xs">
                                {part.reasoning}
                            </div>
                        </div>
                    </motion.div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}

function ToolCall({
    toolInvocations,
}: Pick<ChatMessageProps, "toolInvocations">) {
    if (!toolInvocations?.length) return null

    return (
        <div className="flex flex-col items-start gap-2">
            {toolInvocations.map((invocation, index) => {
                const isCancelled =
                    invocation.state === "result" &&
                    invocation.result.__cancelled === true

                if (isCancelled) {
                    return (
                        <div
                            key={index}
                            className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
                        >
                            <Ban className="h-4 w-4" />
                            <span>
                                Cancelled{" "}
                                <span className="font-mono">
                                    {"`"}
                                    {invocation.toolName}
                                    {"`"}
                                </span>
                            </span>
                        </div>
                    )
                }

                switch (invocation.state) {
                    case "partial-call":
                    case "call":
                        return (
                            <div
                                key={index}
                                className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
                            >
                                <Terminal className="h-4 w-4" />
                                <span>
                                    Calling{" "}
                                    <span className="font-mono">
                                        {"`"}
                                        {invocation.toolName}
                                        {"`"}
                                    </span>
                                    ...
                                </span>
                                <Loader2 className="h-3 w-3 animate-spin" />
                            </div>
                        )
                    case "result":
                        return (
                            <div
                                key={index}
                                className="flex flex-col gap-1.5 rounded-lg border bg-muted/50 px-3 py-2 text-sm"
                            >
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Code2 className="h-4 w-4" />
                                    <span>
                                        Result from{" "}
                                        <span className="font-mono">
                                            {"`"}
                                            {invocation.toolName}
                                            {"`"}
                                        </span>
                                    </span>
                                </div>
                                <JsonChip content={invocation.result} />
                            </div>
                        )
                    default:
                        return null
                }
            })}
        </div>
    )
}
