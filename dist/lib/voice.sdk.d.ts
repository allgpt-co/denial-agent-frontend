/**
 * Voice SDK for Speech Recognition and Speech Synthesis
 * Provides browser-native voice capabilities for Chromium-based browsers
 */
export interface VoiceConfig {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    pitch: number;
    rate: number;
    volume: number;
    voiceURI?: string;
}
export declare const defaultVoiceConfig: VoiceConfig;
export interface VoiceSupport {
    speechRecognition: boolean;
    speechSynthesis: boolean;
}
export declare function getVoiceSupport(): VoiceSupport;
export declare class SpeechRecognitionManager {
    private recognition;
    private isListening;
    private config;
    onResult: ((transcript: string, isFinal: boolean) => void) | null;
    onStart: (() => void) | null;
    onEnd: (() => void) | null;
    onError: ((error: string) => void) | null;
    onSpeechStart: (() => void) | null;
    onSpeechEnd: (() => void) | null;
    constructor(config?: Partial<VoiceConfig>);
    private initRecognition;
    private getErrorMessage;
    start(): boolean;
    stop(): void;
    abort(): void;
    updateConfig(config: Partial<VoiceConfig>): void;
    getIsListening(): boolean;
    destroy(): void;
}
export declare class SpeechSynthesisManager {
    private utterance;
    private config;
    private isSpeaking;
    private availableVoices;
    onStart: (() => void) | null;
    onEnd: (() => void) | null;
    onPause: (() => void) | null;
    onResume: (() => void) | null;
    onError: ((error: string) => void) | null;
    onBoundary: ((charIndex: number, charLength: number) => void) | null;
    constructor(config?: Partial<VoiceConfig>);
    private loadVoices;
    getVoices(): SpeechSynthesisVoice[];
    getVoicesByLanguage(lang: string): SpeechSynthesisVoice[];
    speak(text: string): boolean;
    stop(): void;
    pause(): void;
    resume(): void;
    getIsSpeaking(): boolean;
    updateConfig(config: Partial<VoiceConfig>): void;
    destroy(): void;
}
export declare function stripMarkdownForSpeech(text: string): string;
export declare function getSpeechRecognitionManager(config?: Partial<VoiceConfig>): SpeechRecognitionManager;
export declare function getSpeechSynthesisManager(config?: Partial<VoiceConfig>): SpeechSynthesisManager;
//# sourceMappingURL=voice.sdk.d.ts.map