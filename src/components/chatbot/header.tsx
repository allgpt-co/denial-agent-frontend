import { useState } from "react"
import { RefreshCw, X, Maximize2, Minimize2, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ServiceMetadata } from "@/hooks/use-chatbot-api"
import Setting from "./setting"
import type { VoiceConfig } from "@/lib/voice.sdk"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
    metadata: ServiceMetadata | null
    selectedAgent: string
    selectedModel: string
    onAgentChange: (agent: string) => void
    onModelChange: (model: string) => void
    onClose?: () => void
    onRefresh?: () => void
    className?: string

    title?: string
    titleUrl?: string
    subtitle?: string
    // Voice props
    voiceConfig?: VoiceConfig
    onVoiceConfigChange?: (config: Partial<VoiceConfig>) => void
    availableVoices?: SpeechSynthesisVoice[]
    selectedVoice?: SpeechSynthesisVoice | null
    onVoiceChange?: (voice: SpeechSynthesisVoice | null) => void
    autoSpeak?: boolean
    onAutoSpeakChange?: (enabled: boolean) => void
    isMaximized?: boolean
    onMaximize?: () => void
    avatar?: string
    onHistory?: () => void
}

export function Header({
    metadata,
    selectedAgent,
    selectedModel,
    onAgentChange,
    onModelChange,
    onClose,
    onRefresh,
    className,
    title = "AI Assistant",
    titleUrl,
    subtitle = "Online",
    voiceConfig,
    onVoiceConfigChange,
    availableVoices,
    selectedVoice,
    onVoiceChange,
    autoSpeak,
    onAutoSpeakChange,
    isMaximized,
    onMaximize,
    avatar,
    onHistory,
}: HeaderProps) {
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = () => {
        if (isRefreshing) return

        setIsRefreshing(true)
        onRefresh?.()

        // stop animation after a few seconds
        setTimeout(() => {
            setIsRefreshing(false)
        }, 1000)
    }

    const TitleContent = () => (
        <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
                <Avatar className="size-9 border border-border/40 shadow-sm transition-transform group-hover:scale-105">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>{title}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background shadow-sm animate-pulse" />
            </div>
            <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-semibold text-foreground/90 tracking-tight leading-none group-hover:text-primary transition-colors">
                    {title}
                </h3>
                {subtitle && (
                    <p className="text-[11px] text-muted-foreground font-medium leading-none">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    )

    return (
        <TooltipProvider delayDuration={300}>
            <div
                className={cn(
                    "flex items-center justify-between border-b border-border/40 bg-background/80 p-3.5 backdrop-blur-md supports-[backdrop-filter]:bg-background/60",
                    className
                )}
            >
                {/* Left */}
                {titleUrl ? (
                    <a
                        href={titleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-visible:outline-none rounded-md"
                    >
                        <TitleContent />
                    </a>
                ) : (
                    <TitleContent />
                )}

                {/* Right */}
                <div className="flex items-center gap-0.5">
                    {onHistory && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onHistory}
                                    className="rounded-full h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <History className="h-4 w-4" />
                                    <span className="sr-only">History</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>History</TooltipContent>
                        </Tooltip>
                    )}

                    {onMaximize && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onMaximize}
                                    className="rounded-full h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {isMaximized ? (
                                        <Minimize2 className="h-4 w-4" />
                                    ) : (
                                        <Maximize2 className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">
                                        {isMaximized ? "Minimize" : "Maximize"}
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{isMaximized ? "Minimize" : "Maximize"}</TooltipContent>
                        </Tooltip>
                    )}

                    <Setting
                        metadata={metadata}
                        selectedAgent={selectedAgent}
                        selectedModel={selectedModel}
                        onAgentChange={onAgentChange}
                        onModelChange={onModelChange}
                        voiceConfig={voiceConfig}
                        onVoiceConfigChange={onVoiceConfigChange}
                        availableVoices={availableVoices}
                        selectedVoice={selectedVoice}
                        onVoiceChange={onVoiceChange}
                        autoSpeak={autoSpeak}
                        onAutoSpeakChange={onAutoSpeakChange}
                    />

                    {onRefresh && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="rounded-full h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <RefreshCw
                                        className={cn(
                                            "h-4 w-4",
                                            isRefreshing && "animate-spin text-primary"
                                        )}
                                    />
                                    <span className="sr-only">Refresh Chat</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Restart</TooltipContent>
                        </Tooltip>
                    )}

                    {onClose && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="rounded-full h-8 w-8 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors ml-1"
                                >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Close Chat</TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>
        </TooltipProvider>
    )
}
