import { useCallback, useEffect, useRef, useState } from "react"
import {
    SpeechRecognitionManager,
    SpeechSynthesisManager,
    type VoiceConfig,
    defaultVoiceConfig,
    getVoiceSupport,
    stripMarkdownForSpeech,
} from "@/lib/voice.sdk"

export interface UseVoiceOptions {
    config?: Partial<VoiceConfig>
    onTranscript?: (transcript: string, isFinal: boolean) => void
    onSpeechStart?: () => void
    onSpeechEnd?: () => void
    onError?: (error: string) => void
}

export interface UseVoiceReturn {
    // State
    isListening: boolean
    isSpeaking: boolean
    transcript: string
    interimTranscript: string
    error: string | null

    // Support detection
    isRecognitionSupported: boolean
    isSynthesisSupported: boolean

    // Recognition controls
    startListening: () => void
    stopListening: () => void
    toggleListening: () => void
    clearTranscript: () => void

    // Synthesis controls
    speak: (text: string) => void
    stopSpeaking: () => void
    pauseSpeaking: () => void
    resumeSpeaking: () => void

    // Voice management
    availableVoices: SpeechSynthesisVoice[]
    selectedVoice: SpeechSynthesisVoice | null
    setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void

    // Config
    voiceConfig: VoiceConfig
    updateConfig: (config: Partial<VoiceConfig>) => void
}

export function useVoice(options: UseVoiceOptions = {}): UseVoiceReturn {
    const { config, onTranscript, onSpeechStart, onSpeechEnd, onError } = options

    // State
    const [isListening, setIsListening] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [interimTranscript, setInterimTranscript] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
    const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({
        ...defaultVoiceConfig,
        ...config,
    })

    // Support detection
    const [support, setSupport] = useState(() => getVoiceSupport())

    // Managers
    const recognitionRef = useRef<SpeechRecognitionManager | null>(null)
    const synthesisRef = useRef<SpeechSynthesisManager | null>(null)

    // Initialize managers
    useEffect(() => {
        const voiceSupport = getVoiceSupport()
        setSupport(voiceSupport)

        if (voiceSupport.speechRecognition) {
            recognitionRef.current = new SpeechRecognitionManager(voiceConfig)

            recognitionRef.current.onStart = () => {
                setIsListening(true)
                setError(null)
                onSpeechStart?.()
            }

            recognitionRef.current.onEnd = () => {
                setIsListening(false)
                onSpeechEnd?.()
            }

            recognitionRef.current.onError = (errorMessage) => {
                setError(errorMessage)
                setIsListening(false)
                onError?.(errorMessage)
            }

            recognitionRef.current.onResult = (text, isFinal) => {
                if (isFinal) {
                    setTranscript((prev) => prev + text)
                    setInterimTranscript("")
                } else {
                    setInterimTranscript(text)
                }
                onTranscript?.(text, isFinal)
            }
        }

        if (voiceSupport.speechSynthesis) {
            synthesisRef.current = new SpeechSynthesisManager(voiceConfig)

            synthesisRef.current.onStart = () => {
                setIsSpeaking(true)
            }

            synthesisRef.current.onEnd = () => {
                setIsSpeaking(false)
            }

            synthesisRef.current.onError = (errorMessage) => {
                setError(errorMessage)
                setIsSpeaking(false)
            }

            // Load voices
            const loadVoices = () => {
                const voices = synthesisRef.current?.getVoices() || []
                setAvailableVoices(voices)

                // Set default voice based on language
                if (!selectedVoice && voices.length > 0) {
                    const langVoices = voices.filter((v) =>
                        v.lang.toLowerCase().startsWith(voiceConfig.lang.toLowerCase().split("-")[0])
                    )
                    if (langVoices.length > 0) {
                        setSelectedVoice(langVoices[0])
                    }
                }
            }

            // Initial load
            loadVoices()

            // Handle async voice loading
            if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.onvoiceschanged = loadVoices
            }
        }

        return () => {
            recognitionRef.current?.destroy()
            synthesisRef.current?.destroy()
        }
    }, [])

    // Update config
    const updateConfig = useCallback((newConfig: Partial<VoiceConfig>) => {
        setVoiceConfig((prev) => {
            const updated = { ...prev, ...newConfig }
            recognitionRef.current?.updateConfig(updated)
            synthesisRef.current?.updateConfig(updated)
            return updated
        })
    }, [])

    // Recognition controls
    const startListening = useCallback(() => {
        setError(null)
        setInterimTranscript("")
        recognitionRef.current?.start()
    }, [])

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop()
    }, [])

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening()
        } else {
            startListening()
        }
    }, [isListening, startListening, stopListening])

    const clearTranscript = useCallback(() => {
        setTranscript("")
        setInterimTranscript("")
    }, [])

    // Synthesis controls
    const speak = useCallback((text: string) => {
        setError(null)
        const cleanText = stripMarkdownForSpeech(text)

        // Update voice if selected
        if (selectedVoice) {
            synthesisRef.current?.updateConfig({ voiceURI: selectedVoice.voiceURI })
        }

        synthesisRef.current?.speak(cleanText)
    }, [selectedVoice])

    const stopSpeaking = useCallback(() => {
        synthesisRef.current?.stop()
    }, [])

    const pauseSpeaking = useCallback(() => {
        synthesisRef.current?.pause()
    }, [])

    const resumeSpeaking = useCallback(() => {
        synthesisRef.current?.resume()
    }, [])

    // Handle voice selection
    const handleSetSelectedVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
        setSelectedVoice(voice)
        if (voice) {
            updateConfig({ voiceURI: voice.voiceURI })
        }
    }, [updateConfig])

    return {
        // State
        isListening,
        isSpeaking,
        transcript,
        interimTranscript,
        error,

        // Support detection
        isRecognitionSupported: support.speechRecognition,
        isSynthesisSupported: support.speechSynthesis,

        // Recognition controls
        startListening,
        stopListening,
        toggleListening,
        clearTranscript,

        // Synthesis controls
        speak,
        stopSpeaking,
        pauseSpeaking,
        resumeSpeaking,

        // Voice management
        availableVoices,
        selectedVoice,
        setSelectedVoice: handleSetSelectedVoice,

        // Config
        voiceConfig,
        updateConfig,
    }
}
