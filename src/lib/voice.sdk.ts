/**
 * Voice SDK for Speech Recognition and Speech Synthesis
 * Provides browser-native voice capabilities for Chromium-based browsers
 */

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number
    readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: SpeechRecognitionErrorCode
    readonly message: string
}

type SpeechRecognitionErrorCode =
    | "no-speech"
    | "aborted"
    | "audio-capture"
    | "network"
    | "not-allowed"
    | "service-not-available"
    | "bad-grammar"
    | "language-not-supported"

interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    maxAlternatives: number
    grammars: SpeechGrammarList
    start(): void
    stop(): void
    abort(): void
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null
    onend: ((this: SpeechRecognition, ev: Event) => any) | null
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null
}

interface SpeechGrammarList {
    readonly length: number
    addFromString(string: string, weight?: number): void
    addFromURI(src: string, weight?: number): void
    item(index: number): SpeechGrammar
}

interface SpeechGrammar {
    src: string
    weight: number
}

declare var webkitSpeechRecognition: {
    new(): SpeechRecognition
    prototype: SpeechRecognition
}

declare var SpeechRecognition: {
    new(): SpeechRecognition
    prototype: SpeechRecognition
}

// Voice SDK Configuration
export interface VoiceConfig {
    lang: string
    continuous: boolean
    interimResults: boolean
    maxAlternatives: number
    pitch: number
    rate: number
    volume: number
    voiceURI?: string
}

export const defaultVoiceConfig: VoiceConfig = {
    lang: "en-US",
    continuous: false,
    interimResults: true,
    maxAlternatives: 1,
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
}

// Voice support detection
export interface VoiceSupport {
    speechRecognition: boolean
    speechSynthesis: boolean
}

export function getVoiceSupport(): VoiceSupport {
    const speechRecognition = !!(
        typeof window !== "undefined" &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    )

    const speechSynthesis = !!(
        typeof window !== "undefined" &&
        window.speechSynthesis
    )

    return {
        speechRecognition,
        speechSynthesis,
    }
}

// Speech Recognition Manager
export class SpeechRecognitionManager {
    private recognition: SpeechRecognition | null = null
    private isListening: boolean = false
    private config: VoiceConfig

    onResult: ((transcript: string, isFinal: boolean) => void) | null = null
    onStart: (() => void) | null = null
    onEnd: (() => void) | null = null
    onError: ((error: string) => void) | null = null
    onSpeechStart: (() => void) | null = null
    onSpeechEnd: (() => void) | null = null

    constructor(config: Partial<VoiceConfig> = {}) {
        this.config = { ...defaultVoiceConfig, ...config }
        this.initRecognition()
    }

    private initRecognition(): boolean {
        if (typeof window === "undefined") return false

        const SpeechRecognitionAPI =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

        if (!SpeechRecognitionAPI) {
            console.warn("Speech Recognition is not supported in this browser")
            return false
        }

        try {
            const recognition = new SpeechRecognitionAPI() as SpeechRecognition
            recognition.lang = this.config.lang
            recognition.continuous = this.config.continuous
            recognition.interimResults = this.config.interimResults
            recognition.maxAlternatives = this.config.maxAlternatives

            recognition.onstart = () => {
                this.isListening = true
                this.onStart?.()
            }

            recognition.onend = () => {
                this.isListening = false
                this.onEnd?.()
            }

            recognition.onerror = (event) => {
                this.isListening = false
                const errorMessage = this.getErrorMessage(event.error)
                this.onError?.(errorMessage)
            }

            recognition.onresult = (event) => {
                let transcript = ""
                let isFinal = false

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i]
                    transcript += result[0].transcript
                    if (result.isFinal) {
                        isFinal = true
                    }
                }

                this.onResult?.(transcript, isFinal)
            }

            recognition.onspeechstart = () => {
                this.onSpeechStart?.()
            }

            recognition.onspeechend = () => {
                this.onSpeechEnd?.()
            }

            this.recognition = recognition
            return true
        } catch (error) {
            console.error("Failed to initialize speech recognition:", error)
            return false
        }
    }

    private getErrorMessage(error: SpeechRecognitionErrorCode): string {
        const errorMessages: Record<SpeechRecognitionErrorCode, string> = {
            "no-speech": "No speech was detected. Please try again.",
            "aborted": "Speech recognition was aborted.",
            "audio-capture": "No microphone was found. Ensure a microphone is connected.",
            "network": "Network error occurred. Check your internet connection.",
            "not-allowed": "Microphone access denied. Please allow microphone permissions.",
            "service-not-available": "Speech service is not available.",
            "bad-grammar": "Speech grammar error occurred.",
            "language-not-supported": "Language is not supported.",
        }
        return errorMessages[error] || `Unknown error: ${error}`
    }

    start(): boolean {
        if (!this.recognition) {
            const initialized = this.initRecognition()
            if (!initialized) return false
        }

        if (this.isListening) {
            return true
        }

        try {
            this.recognition?.start()
            return true
        } catch (error) {
            console.error("Failed to start speech recognition:", error)
            return false
        }
    }

    stop(): void {
        if (this.recognition && this.isListening) {
            this.recognition.stop()
        }
    }

    abort(): void {
        if (this.recognition) {
            this.recognition.abort()
        }
    }

    updateConfig(config: Partial<VoiceConfig>): void {
        this.config = { ...this.config, ...config }
        if (this.recognition) {
            this.recognition.lang = this.config.lang
            this.recognition.continuous = this.config.continuous
            this.recognition.interimResults = this.config.interimResults
            this.recognition.maxAlternatives = this.config.maxAlternatives
        }
    }

    getIsListening(): boolean {
        return this.isListening
    }

    destroy(): void {
        this.abort()
        this.recognition = null
        this.onResult = null
        this.onStart = null
        this.onEnd = null
        this.onError = null
        this.onSpeechStart = null
        this.onSpeechEnd = null
    }
}

// Speech Synthesis Manager
export class SpeechSynthesisManager {
    private utterance: SpeechSynthesisUtterance | null = null
    private config: VoiceConfig
    private isSpeaking: boolean = false
    private availableVoices: SpeechSynthesisVoice[] = []

    onStart: (() => void) | null = null
    onEnd: (() => void) | null = null
    onPause: (() => void) | null = null
    onResume: (() => void) | null = null
    onError: ((error: string) => void) | null = null
    onBoundary: ((charIndex: number, charLength: number) => void) | null = null

    constructor(config: Partial<VoiceConfig> = {}) {
        this.config = { ...defaultVoiceConfig, ...config }
        this.loadVoices()
    }

    private loadVoices(): void {
        if (typeof window === "undefined" || !window.speechSynthesis) return

        // Load voices immediately if available
        this.availableVoices = window.speechSynthesis.getVoices()

        // Also listen for voiceschanged event (some browsers load voices async)
        window.speechSynthesis.onvoiceschanged = () => {
            this.availableVoices = window.speechSynthesis.getVoices()
        }
    }

    getVoices(): SpeechSynthesisVoice[] {
        return this.availableVoices
    }

    getVoicesByLanguage(lang: string): SpeechSynthesisVoice[] {
        return this.availableVoices.filter((voice) =>
            voice.lang.toLowerCase().startsWith(lang.toLowerCase().split("-")[0])
        )
    }

    speak(text: string): boolean {
        if (typeof window === "undefined" || !window.speechSynthesis) {
            console.warn("Speech Synthesis is not supported in this browser")
            return false
        }

        // Cancel any ongoing speech
        this.stop()

        try {
            this.utterance = new SpeechSynthesisUtterance(text)
            this.utterance.lang = this.config.lang
            this.utterance.pitch = this.config.pitch
            this.utterance.rate = this.config.rate
            this.utterance.volume = this.config.volume

            // Set voice if specified
            if (this.config.voiceURI) {
                const voice = this.availableVoices.find(
                    (v) => v.voiceURI === this.config.voiceURI
                )
                if (voice) {
                    this.utterance.voice = voice
                }
            }

            this.utterance.onstart = () => {
                this.isSpeaking = true
                this.onStart?.()
            }

            this.utterance.onend = () => {
                this.isSpeaking = false
                this.onEnd?.()
            }

            this.utterance.onerror = (event) => {
                this.isSpeaking = false
                this.onError?.(event.error)
            }

            this.utterance.onpause = () => {
                this.onPause?.()
            }

            this.utterance.onresume = () => {
                this.onResume?.()
            }

            this.utterance.onboundary = (event) => {
                this.onBoundary?.(event.charIndex, event.charLength)
            }

            window.speechSynthesis.speak(this.utterance)
            return true
        } catch (error) {
            console.error("Failed to speak:", error)
            return false
        }
    }

    stop(): void {
        if (typeof window === "undefined" || !window.speechSynthesis) return
        window.speechSynthesis.cancel()
        this.isSpeaking = false
    }

    pause(): void {
        if (typeof window === "undefined" || !window.speechSynthesis) return
        window.speechSynthesis.pause()
    }

    resume(): void {
        if (typeof window === "undefined" || !window.speechSynthesis) return
        window.speechSynthesis.resume()
    }

    getIsSpeaking(): boolean {
        return this.isSpeaking
    }

    updateConfig(config: Partial<VoiceConfig>): void {
        this.config = { ...this.config, ...config }
    }

    destroy(): void {
        this.stop()
        this.utterance = null
        this.onStart = null
        this.onEnd = null
        this.onPause = null
        this.onResume = null
        this.onError = null
        this.onBoundary = null
    }
}

// Utility to strip markdown for cleaner TTS
export function stripMarkdownForSpeech(text: string): string {
    return text
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, "Code block omitted. ")
        .replace(/`[^`]+`/g, (match) => match.slice(1, -1))
        // Remove headers
        .replace(/#{1,6}\s+/g, "")
        // Remove bold and italic
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/__([^_]+)__/g, "$1")
        .replace(/_([^_]+)_/g, "$1")
        // Remove links but keep text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        // Remove images
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
        // Remove horizontal rules
        .replace(/---/g, "")
        // Remove blockquotes
        .replace(/^>\s+/gm, "")
        // Remove list markers
        .replace(/^[\s]*[-*+]\s+/gm, "")
        .replace(/^[\s]*\d+\.\s+/gm, "")
        // Cleanup extra whitespace
        .replace(/\n{3,}/g, "\n\n")
        .trim()
}

// Export a singleton for convenience
let recognitionManagerInstance: SpeechRecognitionManager | null = null
let synthesisManagerInstance: SpeechSynthesisManager | null = null

export function getSpeechRecognitionManager(config?: Partial<VoiceConfig>): SpeechRecognitionManager {
    if (!recognitionManagerInstance) {
        recognitionManagerInstance = new SpeechRecognitionManager(config)
    } else if (config) {
        recognitionManagerInstance.updateConfig(config)
    }
    return recognitionManagerInstance
}

export function getSpeechSynthesisManager(config?: Partial<VoiceConfig>): SpeechSynthesisManager {
    if (!synthesisManagerInstance) {
        synthesisManagerInstance = new SpeechSynthesisManager(config)
    } else if (config) {
        synthesisManagerInstance.updateConfig(config)
    }
    return synthesisManagerInstance
}
