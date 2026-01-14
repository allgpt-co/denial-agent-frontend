"use client"

import {
    forwardRef,
    useCallback,
    useRef,
    useState,
    type ReactElement,
} from "react"
import { ArrowDown, ThumbsDown, ThumbsUp, Volume2, Square } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAutoScroll } from "@/hooks/use-auto-scroll"
import { Button } from "@/components/ui/button"
import { type Message } from "@/components/ui/chat-message"
import { CopyButton } from "@/components/ui/copy-button"
import { MessageInput } from "@/components/ui/message-input"
import { MessageList } from "@/components/ui/message-list"
import { PromptSuggestions } from "@/components/ui/prompt-suggestions"

interface ChatPropsBase {
    handleSubmit: (
        event?: { preventDefault?: () => void },
        options?: { experimental_attachments?: FileList }
    ) => void
    messages: Array<Message>
    input: string
    className?: string
    handleInputChange: React.ChangeEventHandler<HTMLTextAreaElement>
    isGenerating: boolean
    stop?: () => void
    onRateResponse?: (
        messageId: string,
        rating: "thumbs-up" | "thumbs-down"
    ) => void
    setMessages?: (messages: any[]) => void
    transcribeAudio?: (blob: Blob) => Promise<string>
    placeholder?: string
    label?: string

    // Voice props
    isListening?: boolean
    startListening?: () => void
    stopListening?: () => void
    isSpeechSupported?: boolean

    // Text-to-Speech props
    speak?: (text: string) => void
    stopSpeaking?: () => void
    isSpeaking?: boolean
}

interface ChatPropsWithoutSuggestions extends ChatPropsBase {
    append?: never
    suggestions?: never
}

interface ChatPropsWithSuggestions extends ChatPropsBase {
    append: (message: { role: "user"; content: string }) => void
    suggestions: string[]
}

type ChatProps = ChatPropsWithoutSuggestions | ChatPropsWithSuggestions

export function Chat({
    messages,
    handleSubmit,
    input,
    handleInputChange,
    stop,
    isGenerating,
    append,
    suggestions,
    className,
    onRateResponse,
    setMessages,
    transcribeAudio,
    placeholder,
    label,
    isListening,
    startListening,
    stopListening,
    isSpeechSupported,
    speak,
    stopSpeaking,
    isSpeaking,
}: ChatProps) {
    const lastMessage = messages.at(-1)
    const isEmpty = messages.length === 0
    const isTyping = lastMessage?.role === "user"

    const messagesRef = useRef(messages)
    messagesRef.current = messages

    // Enhanced stop function that marks pending tool calls as cancelled
    const handleStop = useCallback(() => {
        stop?.()

        if (!setMessages) return

        const latestMessages = [...messagesRef.current]
        const lastAssistantMessage = latestMessages.findLast(
            (m: Message) => m.role === "assistant"
        )

        if (!lastAssistantMessage) return

        let needsUpdate = false
        let updatedMessage = { ...lastAssistantMessage }

        if (lastAssistantMessage.toolInvocations) {
            const updatedToolInvocations = lastAssistantMessage.toolInvocations.map(
                (toolInvocation: any) => {
                    if (toolInvocation.state === "call") {
                        needsUpdate = true
                        return {
                            ...toolInvocation,
                            state: "result",
                            result: {
                                content: "Tool execution was cancelled",
                                __cancelled: true, // Special marker to indicate cancellation
                            },
                        } as const
                    }
                    return toolInvocation
                }
            )

            if (needsUpdate) {
                updatedMessage = {
                    ...updatedMessage,
                    toolInvocations: updatedToolInvocations,
                }
            }
        }

        if (lastAssistantMessage.parts && lastAssistantMessage.parts.length > 0) {
            const updatedParts = lastAssistantMessage.parts.map((part: any) => {
                if (
                    part.type === "tool-invocation" &&
                    part.toolInvocation &&
                    part.toolInvocation.state === "call"
                ) {
                    needsUpdate = true
                    return {
                        ...part,
                        toolInvocation: {
                            ...part.toolInvocation,
                            state: "result",
                            result: {
                                content: "Tool execution was cancelled",
                                __cancelled: true,
                            },
                        },
                    }
                }
                return part
            })

            if (needsUpdate) {
                updatedMessage = {
                    ...updatedMessage,
                    parts: updatedParts,
                }
            }
        }

        if (needsUpdate) {
            const messageIndex = latestMessages.findIndex(
                (m) => m.id === lastAssistantMessage.id
            )
            if (messageIndex !== -1) {
                latestMessages[messageIndex] = updatedMessage
                setMessages(latestMessages)
            }
        }
    }, [stop, setMessages, messagesRef])

    const messageOptions = useCallback(
        (message: Message) => ({
            actions: (
                <>
                    {speak && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => {
                                if (isSpeaking && stopSpeaking) {
                                    stopSpeaking()
                                } else {
                                    speak(message.content)
                                }
                            }}
                        >
                            {isSpeaking ? <Square className="h-3 w-3 fill-current" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                    )}
                    {onRateResponse ? (
                        <>
                            <div className="border-r pr-1 inline-flex items-center h-4 my-auto mx-1">
                                <CopyButton
                                    content={message.content}
                                    copyMessage="Copied response to clipboard!"
                                />
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => onRateResponse(message.id, "thumbs-up")}
                            >
                                <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => onRateResponse(message.id, "thumbs-down")}
                            >
                                <ThumbsDown className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <CopyButton
                            content={message.content}
                            copyMessage="Copied response to clipboard!"
                        />
                    )}
                </>
            ),
        }),
        [onRateResponse, speak, isSpeaking, stopSpeaking]
    )

    return (
        <ChatContainer className={cn(className, "relative")}>
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {isEmpty && append && suggestions ? (
                    <div className="flex h-full flex-col justify-center overflow-y-auto">
                        <PromptSuggestions
                            label={label || ""}
                            append={append}
                            suggestions={suggestions}
                        />
                    </div>
                ) : messages.length > 0 ? (
                    <ChatMessages messages={messages} className="flex-1 w-full px-4 pt-8">
                        <div className="max-w-4xl mx-auto w-full">
                            <MessageList
                                messages={messages}
                                isTyping={isTyping}
                                messageOptions={messageOptions}
                            />
                            {append && suggestions && suggestions.length > 0 && !isGenerating && (
                                <div className="mt-6 flex flex-wrap gap-2 pb-8">
                                    {suggestions.map((suggestion) => (
                                        <Button
                                            key={suggestion}
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl bg-background/50 backdrop-blur-sm text-xs hover:bg-primary hover:text-primary-foreground transition-all duration-300 border-primary/20 hover:border-primary shadow-sm"
                                            onClick={() => append({ role: "user", content: suggestion })}
                                        >
                                            {suggestion}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ChatMessages>
                ) : (
                    <div className="flex-1" />
                )}
            </div>

            <div className="flex-none w-full max-w-4xl mx-auto px-4 pb-6">
                <ChatForm
                    className="relative"
                    isPending={isGenerating || isTyping}
                    handleSubmit={handleSubmit}
                >
                    {({ files, setFiles }) => (
                        <MessageInput
                            value={input}
                            onChange={handleInputChange}
                            allowAttachments
                            files={files}
                            setFiles={setFiles}
                            stop={handleStop}
                            isGenerating={isGenerating}
                            transcribeAudio={transcribeAudio}
                            placeholder={placeholder}
                            isListening={isListening}
                            startListening={startListening}
                            stopListening={stopListening}
                            isSpeechSupported={isSpeechSupported}
                        />
                    )}
                </ChatForm>
            </div>
        </ChatContainer>
    )
}
Chat.displayName = "Chat"

export function ChatMessages({
    messages,
    children,
    className,
}: React.PropsWithChildren<{
    messages: Message[]
    className?: string
}>) {
    const {
        containerRef,
        scrollToBottom,
        handleScroll,
        shouldAutoScroll,
        handleTouchStart,
    } = useAutoScroll([messages])

    return (
        <div
            className={cn("grid grid-cols-1 overflow-y-auto pb-4", className)}
            ref={containerRef}
            onScroll={handleScroll}
            onTouchStart={handleTouchStart}
        >
            <div className="max-w-full [grid-column:1/1] [grid-row:1/1]">
                {children}
            </div>

            {!shouldAutoScroll && (
                <div className="pointer-events-none flex flex-1 items-end justify-end [grid-column:1/1] [grid-row:1/1]">
                    <div className="sticky bottom-0 left-0 flex w-full justify-end">
                        <Button
                            onClick={scrollToBottom}
                            className="pointer-events-auto h-8 w-8 rounded-full ease-in-out animate-in fade-in-0 slide-in-from-bottom-1"
                            size="icon"
                            variant="ghost"
                        >
                            <ArrowDown className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export const ChatContainer = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn("flex flex-col h-full w-full", className)}
            {...props}
        />
    )
})
ChatContainer.displayName = "ChatContainer"

interface ChatFormProps {
    className?: string
    isPending: boolean
    handleSubmit: (
        event?: { preventDefault?: () => void },
        options?: { experimental_attachments?: FileList }
    ) => void
    children: (props: {
        files: File[] | null
        setFiles: React.Dispatch<React.SetStateAction<File[] | null>>
    }) => ReactElement
}

export const ChatForm = forwardRef<HTMLFormElement, ChatFormProps>(
    ({ children, handleSubmit, className }, ref) => {
        const [files, setFiles] = useState<File[] | null>(null)

        const onSubmit = (event: React.FormEvent) => {
            if (!files) {
                handleSubmit(event)
                return
            }

            const fileList = createFileList(files)
            handleSubmit(event, { experimental_attachments: fileList })
            setFiles(null)
        }

        return (
            <form ref={ref} onSubmit={onSubmit} className={className}>
                {children({ files, setFiles })}
            </form>
        )
    }
)
ChatForm.displayName = "ChatForm"

function createFileList(files: File[] | FileList): FileList {
    const dataTransfer = new DataTransfer()
    for (const file of Array.from(files)) {
        dataTransfer.items.add(file)
    }
    return dataTransfer.files
}
