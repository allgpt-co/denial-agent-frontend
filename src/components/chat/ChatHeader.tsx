import { Maximize2, Minimize2, RefreshCcw, Sparkles, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChatHistory } from './ChatHistory'
import { ChatSettings } from './ChatSettings'
import type { Thread } from '@/lib/types'

interface ChatHeaderProps {
    currentAgent: string
    isRefreshing: boolean
    onNewChat: () => void

    // History props
    isHistoryOpen: boolean
    onHistoryOpenChange: (open: boolean) => void
    threads: Thread[]
    currentThreadId: string | null
    onSelectThread: (threadId: string) => void
    onFetchHistory: () => void
    direction?: 'left' | 'right' | 'top' | 'bottom'

    // Settings props
    showSettings?: boolean
    availableAgents: { key: string; description: string }[]
    onAgentChange: (agent: string) => void
    currentModel: string
    onModelChange: (model: string) => void
    availableModels: string[]
    voiceConfig: any
    onVoiceConfigChange: (config: any) => void
    availableVoices: SpeechSynthesisVoice[]
    selectedVoice: SpeechSynthesisVoice | null
    onVoiceChange: (voice: SpeechSynthesisVoice | null) => void
    autoSpeak: boolean
    onAutoSpeakChange: (autoSpeak: boolean) => void

    // Action props
    onDeleteThread?: (threadId: string) => void
    onExpand?: () => void
    isExpanded?: boolean
    onClose?: () => void
}

export function ChatHeader({
    currentAgent,
    isRefreshing,
    onNewChat,
    isHistoryOpen,
    onHistoryOpenChange,
    threads,
    currentThreadId,
    onSelectThread,
    onFetchHistory,
    direction,
    showSettings,
    availableAgents,
    onAgentChange,
    currentModel,
    onModelChange,
    availableModels,
    voiceConfig,
    onVoiceConfigChange,
    availableVoices,
    selectedVoice,
    onVoiceChange,
    autoSpeak,
    onAutoSpeakChange,
    onDeleteThread,
    onExpand,
    isExpanded,
    onClose
}: ChatHeaderProps) {
    return (
        <div className="relative z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-primary to-primary/40 opacity-25 blur transition duration-300 group-hover:opacity-40" />
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-lg">
                            <Sparkles className="h-4.5 w-4.5" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500 shadow-sm" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-sm font-bold leading-tight tracking-tight text-foreground">
                            Agent Chat
                        </h2>
                        <div className="flex items-center gap-1.5 ">
                            <div className="flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                {currentAgent}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <ChatHistory
                        isOpen={isHistoryOpen}
                        onOpenChange={onHistoryOpenChange}
                        threads={threads}
                        currentThreadId={currentThreadId}
                        onSelectThread={onSelectThread}
                        onNewChat={onNewChat}
                        isRefreshing={isRefreshing}
                        onFetchHistory={onFetchHistory}
                        direction={direction}
                    />

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onNewChat}
                        title="New Chat"
                        className="h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
                        disabled={isRefreshing}
                    >
                        <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                    </Button>

                    {onDeleteThread && currentThreadId && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteThread(currentThreadId)}
                            title="Delete this conversation"
                            className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}

                    {onExpand && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onExpand}
                            title={isExpanded ? "Collapse" : "Expand"}
                            className="h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
                        >
                            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                    )}

                    {showSettings && (
                        <ChatSettings
                            currentAgent={currentAgent}
                            onAgentChange={onAgentChange}
                            availableAgents={availableAgents}
                            currentModel={currentModel}
                            onModelChange={onModelChange}
                            availableModels={availableModels}
                            voiceConfig={voiceConfig}
                            onVoiceConfigChange={onVoiceConfigChange}
                            availableVoices={availableVoices}
                            selectedVoice={selectedVoice}
                            onVoiceChange={onVoiceChange}
                            autoSpeak={autoSpeak}
                            onAutoSpeakChange={onAutoSpeakChange}
                        />
                    )}

                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            title="Close"
                            className="h-8 w-8 rounded-lg hover:bg-destructive/5 hover:text-destructive transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
