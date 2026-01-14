import { type VoiceConfig } from "@/lib/voice.sdk";
interface VoiceSettingsProps {
    voiceConfig: VoiceConfig;
    onConfigChange: (config: Partial<VoiceConfig>) => void;
    availableVoices: SpeechSynthesisVoice[];
    selectedVoice: SpeechSynthesisVoice | null;
    onVoiceChange: (voice: SpeechSynthesisVoice | null) => void;
    autoSpeak?: boolean;
    onAutoSpeakChange?: (enabled: boolean) => void;
    className?: string;
}
export declare function VoiceSettingsContent({ voiceConfig, onConfigChange, availableVoices, selectedVoice, onVoiceChange, autoSpeak, onAutoSpeakChange, }: Omit<VoiceSettingsProps, 'className'>): import("react/jsx-runtime").JSX.Element | null;
export declare function VoiceSettings(props: VoiceSettingsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=voice-settings.d.ts.map