"use client"

import { useState, useEffect } from "react"
import { Volume2 } from "lucide-react"
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

export function VoiceSettingsContent({
    voiceConfig,
    onConfigChange,
    availableVoices,
    selectedVoice,
    onVoiceChange,
    autoSpeak = false,
    onAutoSpeakChange,
}: Omit<VoiceSettingsProps, 'className'>) {
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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Voice & Sound</h4>
            </div>


            {/* Auto-speak Toggle */}
            {onAutoSpeakChange && support.speechSynthesis && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                    <Label htmlFor="auto-speak" className="text-xs font-medium cursor-pointer">
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
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5">Voice Engine</Label>
                    <Select
                        value={selectedVoice?.voiceURI || ""}
                        onValueChange={(value) => {
                            const voice = availableVoices.find((v) => v.voiceURI === value)
                            onVoiceChange(voice || null)
                        }}
                    >
                        <SelectTrigger className="h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20">
                            <SelectValue placeholder="Select a voice" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 rounded-xl border-border/40 shadow-xl">
                            {Object.entries(voicesByLanguage).map(([lang, voices]) => (
                                <div key={lang}>
                                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-tight text-muted-foreground/50 bg-muted/20">
                                        {languageNames[lang] || lang}
                                    </div>
                                    {voices.map((voice) => (
                                        <SelectItem
                                            key={voice.voiceURI}
                                            value={voice.voiceURI}
                                            className="text-xs rounded-md my-0.5"
                                        >
                                            <span className="truncate">
                                                {voice.name}
                                                {voice.localService && (
                                                    <span className="ml-1 opacity-50 text-[10px]">
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


            {/* Language */}
            {support.speechRecognition && (
                <div className="space-y-2 pt-1">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5">Recognition Language</Label>
                    <Select
                        value={voiceConfig.lang}
                        onValueChange={(value) => onConfigChange({ lang: value })}
                    >
                        <SelectTrigger className="h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/40 shadow-xl">
                            <SelectItem value="en-US" className="text-xs rounded-md my-0.5">English (US)</SelectItem>
                            <SelectItem value="en-GB" className="text-xs rounded-md my-0.5">English (UK)</SelectItem>
                            <SelectItem value="es-ES" className="text-xs rounded-md my-0.5">Spanish</SelectItem>
                            <SelectItem value="fr-FR" className="text-xs rounded-md my-0.5">French</SelectItem>
                            <SelectItem value="de-DE" className="text-xs rounded-md my-0.5">German</SelectItem>
                            <SelectItem value="it-IT" className="text-xs rounded-md my-0.5">Italian</SelectItem>
                            <SelectItem value="pt-BR" className="text-xs rounded-md my-0.5">Portuguese</SelectItem>
                            <SelectItem value="zh-CN" className="text-xs rounded-md my-0.5">Chinese (Simplified)</SelectItem>
                            <SelectItem value="ja-JP" className="text-xs rounded-md my-0.5">Japanese</SelectItem>
                            <SelectItem value="ko-KR" className="text-xs rounded-md my-0.5">Korean</SelectItem>
                            <SelectItem value="hi-IN" className="text-xs rounded-md my-0.5">Hindi</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Controls Grid */}
            <div className="grid gap-4 pt-1">
                {/* Speech Rate */}
                {support.speechSynthesis && (
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between px-0.5">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">Playback Speed</Label>
                            <span className="text-[10px] font-mono font-bold text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded">
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
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between px-0.5">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">Voice Pitch</Label>
                            <span className="text-[10px] font-mono font-bold text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded">
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
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between px-0.5">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">Output Volume</Label>
                            <span className="text-[10px] font-mono font-bold text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded">
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
            </div>
        </div>
    )
}

export function VoiceSettings(props: VoiceSettingsProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "rounded-full hover:bg-primary/10 transition-colors",
                        props.className
                    )}
                    aria-label="Voice settings"
                >
                    <Volume2 />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <VoiceSettingsContent {...props} />
            </PopoverContent>
        </Popover>
    )
}

