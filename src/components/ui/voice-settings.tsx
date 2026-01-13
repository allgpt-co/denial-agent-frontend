"use client"

import { useState, useEffect } from "react"
import { Volume2, Mic, MicOff, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { getVoiceSupport, type VoiceConfig } from "@/lib/voice.sdk"

interface VoiceSettingsProps {
    voiceConfig: VoiceConfig
    onConfigChange: (config: Partial<VoiceConfig>) => void
    availableVoices: SpeechSynthesisVoice[]
    selectedVoice: SpeechSynthesisVoice | null
    onVoiceChange: (voice: SpeechSynthesisVoice | null) => void
    autoSpeak?: boolean
    onAutoSpeakChange?: (enabled: boolean) => void
    className?: string
}

export function VoiceSettings({
    voiceConfig,
    onConfigChange,
    availableVoices,
    selectedVoice,
    onVoiceChange,
    autoSpeak = false,
    onAutoSpeakChange,
    className,
}: VoiceSettingsProps) {
    const [support, setSupport] = useState(() => getVoiceSupport())

    useEffect(() => {
        setSupport(getVoiceSupport())
    }, [])

    // Group voices by language
    const voicesByLanguage = availableVoices.reduce((acc, voice) => {
        const lang = voice.lang.split("-")[0].toUpperCase()
        if (!acc[lang]) {
            acc[lang] = []
        }
        acc[lang].push(voice)
        return acc
    }, {} as Record<string, SpeechSynthesisVoice[]>)

    const languageNames: Record<string, string> = {
        EN: "English",
        ES: "Spanish",
        FR: "French",
        DE: "German",
        IT: "Italian",
        PT: "Portuguese",
        ZH: "Chinese",
        JA: "Japanese",
        KO: "Korean",
        HI: "Hindi",
        AR: "Arabic",
    }

    if (!support.speechRecognition && !support.speechSynthesis) {
        return null
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "rounded-full hover:bg-primary/10 transition-colors",
                        className
                    )}
                    aria-label="Voice settings"
                >
                    <Volume2 />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Voice Settings</h4>
                    </div>

                    {/* Support Status */}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            {support.speechRecognition ? (
                                <Mic className="h-3 w-3 text-green-500" />
                            ) : (
                                <MicOff className="h-3 w-3 text-red-500" />
                            )}
                            <span>Speech-to-Text</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {support.speechSynthesis ? (
                                <Volume2 className="h-3 w-3 text-green-500" />
                            ) : (
                                <VolumeX className="h-3 w-3 text-red-500" />
                            )}
                            <span>Text-to-Speech</span>
                        </div>
                    </div>

                    {/* Auto-speak Toggle */}
                    {onAutoSpeakChange && support.speechSynthesis && (
                        <div className="flex items-center justify-between">
                            <Label htmlFor="auto-speak" className="text-sm">
                                Auto-speak responses
                            </Label>
                            <Switch
                                id="auto-speak"
                                checked={autoSpeak}
                                onCheckedChange={onAutoSpeakChange}
                            />
                        </div>
                    )}

                    {/* Voice Selection */}
                    {support.speechSynthesis && availableVoices.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm">Voice</Label>
                            <Select
                                value={selectedVoice?.voiceURI || ""}
                                onValueChange={(value) => {
                                    const voice = availableVoices.find((v) => v.voiceURI === value)
                                    onVoiceChange(voice || null)
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a voice" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {Object.entries(voicesByLanguage).map(([lang, voices]) => (
                                        <div key={lang}>
                                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted/30">
                                                {languageNames[lang] || lang}
                                            </div>
                                            {voices.map((voice) => (
                                                <SelectItem
                                                    key={voice.voiceURI}
                                                    value={voice.voiceURI}
                                                    className="pl-4"
                                                >
                                                    <span className="truncate">
                                                        {voice.name}
                                                        {voice.localService && (
                                                            <span className="ml-1 text-xs text-muted-foreground">
                                                                (local)
                                                            </span>
                                                        )}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </div>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Speech Rate */}
                    {support.speechSynthesis && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm">Speed</Label>
                                <span className="text-xs text-muted-foreground">
                                    {voiceConfig.rate.toFixed(1)}x
                                </span>
                            </div>
                            <Slider
                                value={[voiceConfig.rate]}
                                min={0.5}
                                max={2}
                                step={0.1}
                                onValueChange={([value]) => onConfigChange({ rate: value })}
                                className="cursor-pointer"
                            />
                        </div>
                    )}

                    {/* Pitch */}
                    {support.speechSynthesis && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm">Pitch</Label>
                                <span className="text-xs text-muted-foreground">
                                    {voiceConfig.pitch.toFixed(1)}
                                </span>
                            </div>
                            <Slider
                                value={[voiceConfig.pitch]}
                                min={0.5}
                                max={2}
                                step={0.1}
                                onValueChange={([value]) => onConfigChange({ pitch: value })}
                                className="cursor-pointer"
                            />
                        </div>
                    )}

                    {/* Volume */}
                    {support.speechSynthesis && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm">Volume</Label>
                                <span className="text-xs text-muted-foreground">
                                    {Math.round(voiceConfig.volume * 100)}%
                                </span>
                            </div>
                            <Slider
                                value={[voiceConfig.volume]}
                                min={0}
                                max={1}
                                step={0.1}
                                onValueChange={([value]) => onConfigChange({ volume: value })}
                                className="cursor-pointer"
                            />
                        </div>
                    )}

                    {/* Language */}
                    {support.speechRecognition && (
                        <div className="space-y-2">
                            <Label className="text-sm">Recognition Language</Label>
                            <Select
                                value={voiceConfig.lang}
                                onValueChange={(value) => onConfigChange({ lang: value })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en-US">English (US)</SelectItem>
                                    <SelectItem value="en-GB">English (UK)</SelectItem>
                                    <SelectItem value="es-ES">Spanish</SelectItem>
                                    <SelectItem value="fr-FR">French</SelectItem>
                                    <SelectItem value="de-DE">German</SelectItem>
                                    <SelectItem value="it-IT">Italian</SelectItem>
                                    <SelectItem value="pt-BR">Portuguese</SelectItem>
                                    <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                                    <SelectItem value="ja-JP">Japanese</SelectItem>
                                    <SelectItem value="ko-KR">Korean</SelectItem>
                                    <SelectItem value="hi-IN">Hindi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
