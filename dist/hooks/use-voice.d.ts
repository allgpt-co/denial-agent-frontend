import { type VoiceConfig } from "@/lib/voice.sdk";
export interface UseVoiceOptions {
    config?: Partial<VoiceConfig>;
    onTranscript?: (transcript: string, isFinal: boolean) => void;
    onSpeechStart?: () => void;
    onSpeechEnd?: () => void;
    onError?: (error: string) => void;
}
export interface UseVoiceReturn {
    isListening: boolean;
    isSpeaking: boolean;
    transcript: string;
    interimTranscript: string;
    error: string | null;
    isRecognitionSupported: boolean;
    isSynthesisSupported: boolean;
    startListening: () => void;
    stopListening: () => void;
    toggleListening: () => void;
    clearTranscript: () => void;
    speak: (text: string) => void;
    stopSpeaking: () => void;
    pauseSpeaking: () => void;
    resumeSpeaking: () => void;
    availableVoices: SpeechSynthesisVoice[];
    selectedVoice: SpeechSynthesisVoice | null;
    setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
    voiceConfig: VoiceConfig;
    updateConfig: (config: Partial<VoiceConfig>) => void;
}
export declare function useVoice(options?: UseVoiceOptions): UseVoiceReturn;
//# sourceMappingURL=use-voice.d.ts.map