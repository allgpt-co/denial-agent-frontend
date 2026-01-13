"use client"

import { useState, useEffect, useCallback } from "react"
import { Volume2, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { getVoiceSupport, SpeechSynthesisManager, stripMarkdownForSpeech, type VoiceConfig } from "@/lib/voice.sdk"

interface SpeakButtonProps {
    content: string
    voiceConfig?: Partial<VoiceConfig>
    className?: string
    size?: "sm" | "default" | "icon"
    variant?: "ghost" | "outline" | "default"
}

export function SpeakButton({
    content,
    voiceConfig,
    className,
    size = "icon",
    variant = "ghost",
}: SpeakButtonProps) {
    const [isSupported, setIsSupported] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [manager, setManager] = useState<SpeechSynthesisManager | null>(null)

    useEffect(() => {
        const support = getVoiceSupport()
        setIsSupported(support.speechSynthesis)

        if (support.speechSynthesis) {
            const synthesisManager = new SpeechSynthesisManager(voiceConfig)

            synthesisManager.onStart = () => setIsSpeaking(true)
            synthesisManager.onEnd = () => setIsSpeaking(false)
            synthesisManager.onError = () => setIsSpeaking(false)

            setManager(synthesisManager)

            return () => {
                synthesisManager.destroy()
            }
        }
    }, [])

    // Update config when it changes
    useEffect(() => {
        if (manager && voiceConfig) {
            manager.updateConfig(voiceConfig)
        }
    }, [manager, voiceConfig])

    const handleClick = useCallback(() => {
        if (!manager || !content) return

        if (isSpeaking) {
            manager.stop()
        } else {
            const cleanText = stripMarkdownForSpeech(content)
            manager.speak(cleanText)
        }
    }, [manager, content, isSpeaking])

    if (!isSupported) {
        return null
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        size={size}
                        variant={variant}
                        className={cn(
                            "h-6 w-6 transition-colors",
                            isSpeaking && "text-primary bg-primary/10",
                            className
                        )}
                        onClick={handleClick}
                        aria-label={isSpeaking ? "Stop speaking" : "Listen to message"}
                    >
                        {isSpeaking ? (
                            <Square className="h-3 w-3" fill="currentColor" />
                        ) : (
                            <Volume2 />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                    {isSpeaking ? "Stop" : "Listen"}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

// Alternative compact version for inline use
interface SpeakButtonInlineProps {
    content: string
    voiceConfig?: Partial<VoiceConfig>
    className?: string
}

export function SpeakButtonInline({
    content,
    voiceConfig,
    className,
}: SpeakButtonInlineProps) {
    const [isSupported, setIsSupported] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [manager, setManager] = useState<SpeechSynthesisManager | null>(null)

    useEffect(() => {
        const support = getVoiceSupport()
        setIsSupported(support.speechSynthesis)

        if (support.speechSynthesis) {
            const synthesisManager = new SpeechSynthesisManager(voiceConfig)

            synthesisManager.onStart = () => setIsSpeaking(true)
            synthesisManager.onEnd = () => setIsSpeaking(false)
            synthesisManager.onError = () => setIsSpeaking(false)

            setManager(synthesisManager)

            return () => {
                synthesisManager.destroy()
            }
        }
    }, [])

    useEffect(() => {
        if (manager && voiceConfig) {
            manager.updateConfig(voiceConfig)
        }
    }, [manager, voiceConfig])

    const handleClick = useCallback(() => {
        if (!manager || !content) return

        if (isSpeaking) {
            manager.stop()
        } else {
            const cleanText = stripMarkdownForSpeech(content)
            manager.speak(cleanText)
        }
    }, [manager, content, isSpeaking])

    if (!isSupported) {
        return null
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn(
                "inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted",
                isSpeaking && "text-primary",
                className
            )}
            aria-label={isSpeaking ? "Stop speaking" : "Listen to message"}
        >
            {isSpeaking ? (
                <Square className="h-3 w-3" fill="currentColor" />
            ) : (
                <Volume2 className="h-3 w-3" />
            )}
        </button>
    )
}
