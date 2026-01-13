import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

import {
    SettingsIcon,
    Volume2,
    Languages,
    Zap,
    Activity,
    Sparkles,
    RotateCcw
} from "lucide-react"

import type { ServiceMetadata } from "@/hooks/use-chatbot-api"
import type { VoiceConfig } from "@/lib/voice.sdk"
import { getVoiceSupport } from "@/lib/voice.sdk"
import { useState, useEffect } from "react"

interface SettingProps {
    metadata: ServiceMetadata | null
    selectedAgent: string
    selectedModel: string
    onAgentChange: (agent: string) => void
    onModelChange: (model: string) => void

    // Voice props
    voiceConfig?: VoiceConfig
    onVoiceConfigChange?: (config: Partial<VoiceConfig>) => void
    availableVoices?: SpeechSynthesisVoice[]
    selectedVoice?: SpeechSynthesisVoice | null
    onVoiceChange?: (voice: SpeechSynthesisVoice | null) => void
    autoSpeak?: boolean
    onAutoSpeakChange?: (enabled: boolean) => void
}

export default function Setting({
    metadata,
    selectedAgent,
    selectedModel,
    onAgentChange,
    onModelChange,
    voiceConfig,
    onVoiceConfigChange,
    availableVoices,
    selectedVoice,
    onVoiceChange,
    autoSpeak,
    onAutoSpeakChange,
}: SettingProps) {
    const currentAgent = metadata?.agents.find((a) => a.key === selectedAgent)
    const [support, setSupport] = useState(() => getVoiceSupport())

    useEffect(() => {
        setSupport(getVoiceSupport())
    }, [])

    // Group voices by language
    const voicesByLanguage = availableVoices?.reduce((acc, voice) => {
        const lang = voice.lang.split("-")[0].toUpperCase()
        if (!acc[lang]) {
            acc[lang] = []
        }
        acc[lang].push(voice)
        return acc
    }, {} as Record<string, SpeechSynthesisVoice[]>) || {}

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

    const showVoiceSettings =
        voiceConfig &&
        onVoiceConfigChange &&
        availableVoices &&
        onVoiceChange &&
        (support.speechRecognition || support.speechSynthesis)

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="flex">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <SettingsIcon className="h-4 w-4" />
                                    <span className="sr-only">Settings</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Configuration</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[380px] p-0 rounded-xl shadow-lg border-border/50" align="end">
                {/* Header */}
                <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">Configuration</h4>
                </div>

                <div className="p-5 space-y-4">

                    {/* Section: AI Identity */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Agent Selector */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Agent</Label>
                                <Select value={selectedAgent} onValueChange={onAgentChange}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Select Agent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {metadata?.agents.map((agent) => (
                                            <SelectItem key={agent.key} value={agent.key} className="text-xs">
                                                {agent.key}
                                            </SelectItem>
                                        ))}
                                        {(!metadata?.agents || metadata.agents.length === 0) && (
                                            <SelectItem value={selectedAgent || "default"}>{selectedAgent || "Default"}</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Model Selector */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Model</Label>
                                <Select value={selectedModel} onValueChange={onModelChange}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Select Model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {metadata?.models.map((model) => (
                                            <SelectItem key={model} value={model} className="text-xs">
                                                {model}
                                            </SelectItem>
                                        ))}
                                        {(!metadata?.models || metadata.models.length === 0) && (
                                            <SelectItem value={selectedModel || "default"}>{selectedModel || "Default"}</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {currentAgent?.description && (
                            <div className="text-[11px] text-muted-foreground bg-muted/30 p-2 rounded-md border border-border/40 leading-relaxed">
                                {currentAgent.description}
                            </div>
                        )}
                    </div>

                    {showVoiceSettings && (
                        <>
                            {/* Section: Voice Interaction */}
                            <div className="space-y-4">
                                <div className="bg-secondary/20 rounded-lg p-3 space-y-4 border border-border/40">
                                    {/* Auto-speak Toggle */}
                                    {onAutoSpeakChange && support.speechSynthesis && (
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="auto-speak" className="text-[10px] uppercase font-bold text-muted-foreground cursor-pointer">
                                                Auto-speak responses
                                            </Label>
                                            <Switch
                                                id="auto-speak"
                                                checked={autoSpeak}
                                                onCheckedChange={onAutoSpeakChange}
                                                className="scale-75 origin-right"
                                            />
                                        </div>
                                    )}

                                    {/* Recognition Language */}
                                    {support.speechRecognition && voiceConfig && onVoiceConfigChange && (
                                        <div className="flex w-full justify-between">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                                <Languages className="h-3 w-3" /> Input Language
                                            </Label>
                                            <Select
                                                value={voiceConfig.lang}
                                                onValueChange={(value) => onVoiceConfigChange({ lang: value })}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-background w-32">
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

                                {/* Voice Synthesis Options */}
                                {support.speechSynthesis && availableVoices && availableVoices.length > 0 && selectedVoice && onVoiceChange && (
                                    <div className="space-y-1.5 pt-1">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                            <Activity className="h-3 w-3" /> Voice Persona
                                        </Label>
                                        <Select
                                            value={selectedVoice?.voiceURI || ""}
                                            onValueChange={(value) => {
                                                const voice = availableVoices.find((v) => v.voiceURI === value)
                                                onVoiceChange(voice || null)
                                            }}
                                        >
                                            <SelectTrigger className="w-full text-xs h-9">
                                                <SelectValue placeholder="Select a voice" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[300px]">
                                                {Object.entries(voicesByLanguage).map(([lang, voices]) => (
                                                    <div key={lang}>
                                                        <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground bg-muted/40 sticky top-0 z-10 backdrop-blur-sm">
                                                            {languageNames[lang] || lang}
                                                        </div>
                                                        {voices.map((voice) => (
                                                            <SelectItem
                                                                key={voice.voiceURI}
                                                                value={voice.voiceURI}
                                                                className="pl-4 text-xs cursor-pointer"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="truncate max-w-[200px]">{voice.name}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </div>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Audio Sliders - Independent of specific voice selection */}
                                {support.speechSynthesis && voiceConfig && onVoiceConfigChange && (
                                    <div className="grid gap-4 pt-2 border-t border-border/40 mt-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Audio Tuning</Label>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 text-[10px] font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 gap-1.5 transition-all"
                                                onClick={() => onVoiceConfigChange({ rate: 1.0, pitch: 1.0, volume: 1.0 })}
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                                Reset
                                            </Button>
                                        </div>

                                        {/* Speed */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                                                    <Zap className="h-3.5 w-3.5" /> Speed
                                                </Label>
                                                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                    {voiceConfig.rate.toFixed(1)}x
                                                </span>
                                            </div>
                                            <Slider
                                                value={[voiceConfig.rate]}
                                                min={0.5}
                                                max={2}
                                                step={0.1}
                                                onValueChange={([value]) => onVoiceConfigChange({ rate: value })}
                                                className="cursor-pointer"
                                            />
                                        </div>

                                        {/* Pitch */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                                                    <Activity className="h-3.5 w-3.5" /> Pitch
                                                </Label>
                                                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                    {voiceConfig.pitch.toFixed(1)}
                                                </span>
                                            </div>
                                            <Slider
                                                value={[voiceConfig.pitch]}
                                                min={0.5}
                                                max={2}
                                                step={0.1}
                                                onValueChange={([value]) => onVoiceConfigChange({ pitch: value })}
                                                className="cursor-pointer"
                                            />
                                        </div>

                                        {/* Volume */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                                                    <Volume2 className="h-3.5 w-3.5" /> Volume
                                                </Label>
                                                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                    {Math.round(voiceConfig.volume * 100)}%
                                                </span>
                                            </div>
                                            <Slider
                                                value={[voiceConfig.volume]}
                                                min={0}
                                                max={1}
                                                step={0.1}
                                                onValueChange={([value]) => onVoiceConfigChange({ volume: value })}
                                                className="cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                </div>
            </PopoverContent>
        </Popover>
    )
}
