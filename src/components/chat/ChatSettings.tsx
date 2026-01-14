import { Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { VoiceSettingsContent } from '@/components/ui/voice-settings'

interface ChatSettingsProps {
    currentAgent: string
    onAgentChange: (agent: string) => void
    availableAgents: { key: string; description: string }[]
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
}

export function ChatSettings({
    currentAgent,
    onAgentChange,
    availableAgents,
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
}: ChatSettingsProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
                >
                    <Settings2 className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[320px] p-5 rounded-2xl shadow-2xl border-border/40 backdrop-blur-3xl ring-1 ring-black/5 max-h-[85vh] overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-6">
                    <div className="grid gap-6">
                        {/* Agent Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm">Model Configuration</h4>
                            </div>
                            <div className="flex items-center gap-4 w-full">
                                <div className="flex flex-col gap-2 flex-1">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5">Active Agent</label>
                                    <Select value={currentAgent} onValueChange={onAgentChange}>
                                        <SelectTrigger className="h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20">
                                            <SelectValue placeholder="Select Agent" className="capitalize" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/40 shadow-xl">
                                            {availableAgents.map((agent) => (
                                                <SelectItem key={agent.key} value={agent.key} className="text-xs rounded-md my-0.5 capitalize">
                                                    {agent.key}
                                                </SelectItem>
                                            ))}
                                            {availableAgents.length === 0 && (
                                                <SelectItem value={currentAgent || "default"} className="capitalize">{currentAgent || "Default"}</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2 flex-1">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5">Active Model</label>
                                    <Select value={currentModel} onValueChange={onModelChange}>
                                        <SelectTrigger className="h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20">
                                            <SelectValue placeholder="Select Model" className="capitalize" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/40 shadow-xl">
                                            {availableModels.map((model) => (
                                                <SelectItem key={model} value={model} className="text-xs rounded-md my-0.5 capitalize">
                                                    {model}
                                                </SelectItem>
                                            ))}
                                            {availableModels.length === 0 && (
                                                <SelectItem value={currentModel || "default"} className="capitalize">{currentModel || "Default"}</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-border/50" />

                        {/* Voice Section */}
                        <VoiceSettingsContent
                            voiceConfig={voiceConfig}
                            onConfigChange={onVoiceConfigChange}
                            availableVoices={availableVoices}
                            selectedVoice={selectedVoice}
                            onVoiceChange={onVoiceChange}
                            autoSpeak={autoSpeak}
                            onAutoSpeakChange={onAutoSpeakChange}
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
